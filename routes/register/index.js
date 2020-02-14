var express = require('express');
var router = express.Router();
var dbService = require('../../db/service');
var run = require('../../db/run');
var sha256 = require('../../utils/sha256');

router.post('/', function(req, res) {
  var email = req.body.email;
  var plainPassword = req.body.password;
  if(!!email && !!plainPassword) {
    var hashedPassword = sha256(plainPassword);
    dbService(`SELECT * FROM user WHERE email = '${email}'`)
      .then((rows) => {
        if(rows.length > 0) {
          return res.status(409).send({err: 'User already exists.'});
        } else {
          run(`INSERT INTO user (email, password) VALUES ('${email}', '${hashedPassword}')`)
          .then((s) => res.status(201).send(s))
          .catch(err => res.status(500).send({err}));
        }
      })
      .catch(err => res.status(500).send({err}));
  } else {
    return res.status(500).send({err: 'Missing email or password.'});
  }
});

module.exports = router;
