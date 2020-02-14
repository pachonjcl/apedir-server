var db = require('./index');

function sql(sql) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(sql, function(err, rows) {
        if(err) {
          return reject(err);
        }
        resolve(rows);
      });
    });  
  });
}

module.exports = sql;
