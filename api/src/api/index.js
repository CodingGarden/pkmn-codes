const express = require('express');

const codes = require('./codes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/codes', codes);

module.exports = router;
