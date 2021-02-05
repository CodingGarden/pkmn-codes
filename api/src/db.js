const monk = require('monk');

const {
  MONGO_URI,
} = process.env;

const db = monk(MONGO_URI);
const codes = db.get('codes');

module.exports = {
  codes,
};
