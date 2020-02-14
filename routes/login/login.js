var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var db = require('../../db');
var sha256 = require('../../utils/sha256');

router.post('/', function(req, res) {
  var email = req.body.email;
  var plainPassword = req.body.password;
  if(!!email && !!plainPassword) {
    var hashedPassword = sha256(plainPassword);
    db.serialize(()=> {
      db.get(`SELECT * FROM user WHERE email = '${email}' and password = '${hashedPassword}'`, (err, row) => {
        if(err) {
          return res.status(500).send({err: err});
        }
        if(!row) {
          return res.status(404).send({err: 'Email or password were wrong.'});
        } else {
          var tokenData = {
            user_id: row.user_id,
            email: email,
            timestamp: Date.now()
          }
          var token = jwt.sign(tokenData, 'Secret Password', {
            expiresIn: 60 * 60 * 1
          });
          return res.send({token, user_id: row.user_id});
        }
      });
    });
  } else {
    return res.status(500).send({err: 'Missing email or password.'});
  }
});

module.exports = router;
