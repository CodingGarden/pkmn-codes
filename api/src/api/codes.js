const express = require('express');
const Joi = require('joi');
const fetch = require('node-fetch');

const { codes } = require('../db');

const router = express.Router();

const schema = Joi.object({
  code: Joi.string()
    .pattern(/^[a-z0-9]{13}$/i),
});

const {
  POKEMON_CSRF_TOKEN,
  G_CAPTCHA_RESPONSE,
  POKEMON_SESSION_ID,
} = process.env;

async function validateCode(code) {
  const response = await fetch('https://www.pokemon.com/us/pokemon-trainer-club/verify_code/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:86.0) Gecko/20100101 Firefox/86.0',
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-CSRFToken': POKEMON_CSRF_TOKEN,
      'Sec-GPC': '1',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Host: 'www.pokemon.com',
      Origin: 'https://www.pokemon.com',
      Referer: 'https://www.pokemon.com/us/pokemon-trainer-club/enter-codes',
      Cookie: `django_language=en; main_session_id=${POKEMON_SESSION_ID}; op_session_id=${POKEMON_SESSION_ID}; csrftoken=${POKEMON_CSRF_TOKEN}`,
    },
    referrer: 'https://www.pokemon.com/us/pokemon-trainer-club/enter-codes',
    body: `code=${code.toLowerCase()}&g-recaptcha-response=${G_CAPTCHA_RESPONSE}`,
    method: 'POST',
  });
  return response.json();
}

router.get('/', async (req, res, next) => {
  try {
    const allCodes = await codes.find();
    res.json(allCodes);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    // validate the request body
    const { code } = await schema.validateAsync(req.body);
    // validate that the code (is not used / or in DB already)
    const validation = await validateCode(code);
    if (validation.valid) {
      const inserted = await codes.findOneAndUpdate({
        code: validation.coupon_code,
      }, {
        $set: {
          title: validation.coupon_title,
          code: validation.coupon_code,
          scanned_at: new Date(),
        },
      }, {
        upsert: true,
      });
      // insert the code && type into the DB
      res.json(inserted);
    } else {
      const error = new Error(validation.error_message);
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
