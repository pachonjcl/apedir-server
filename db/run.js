var db = require('./index');

function run(sql) {
  return new Promise((resolve, reject) => {
    //db.serialize(() => {
      db.run(sql, function(err) {
        if(err) {
          return reject(err);
        }
        resolve({
          lastID: this.lastID,
          status: 'OK'
        });
      });
    //});  
  });
}

module.exports = run;
