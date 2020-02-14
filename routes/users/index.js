var express = require('express');
var dbService = require('../../db/service');
var run = require('../../db/run');
var verify = require('../../utils/verify');
var router = express.Router();
var sha256 = require('../../utils/sha256');
var IMAGES_FOLDER = require('../../settings').IMAGES_FOLDER;

router.use(verify);

router.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  var user_id = req.user.user_id;
  var file = req.files.file;
  file.mv(`${IMAGES_FOLDER}/profile_${user_id}.png`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.send({status: 'OK'});
  });
});

router.post('/change_password', function(req, res) {
  var user_id = req.user.user_id;
  var oldPassword = req.body.oldPassword;
  var hashOldPassword = sha256(oldPassword);
  var newPassword = req.body.newPassword;
  var hashNewPassword = sha256(newPassword);
  dbService(`SELECT * FROM user WHERE user_id = ${user_id}`)
    .then(function(rows) {
      var user = rows[0];
      if(user.password === hashOldPassword) {
        run(`UPDATE user SET password = '${hashNewPassword}' WHERE user_id = ${user_id}`)
        .then(function() {
          return res.send({status: 'OK'});
        })
      } else {
        throw Error;
      }
    })
    .catch(function(err) {
      return res.status(500).send({err});      
    });
});

router.get('/', function(req, res) {
  dbService('SELECT * FROM user')
    .then(function(rows) {
      return res.send({users: rows});      
    })
    .catch(function(err) {
      return res.status(500).send({err});      
    });
});

module.exports = router;
