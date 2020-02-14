var sqlite3 = require('sqlite3').verbose();

var DB_PATH = require('../settings').DB_PATH;

var db = new sqlite3.Database(DB_PATH, (err)=> {
  if (err) {
    console.error('err', err.message);
  } else {
    console.log('Connected to app db.');
  }
});

module.exports = db;
