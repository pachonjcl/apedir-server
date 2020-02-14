var jwt = require('jsonwebtoken');

function verify(req, res, next) {
  if(!req.headers['authorization']) {
    return res.status(401).send({err: 'Unauthorized.'});
  } else {
    var token = req.headers['authorization'];
    jwt.verify(token, 'Secret Password', function(err, user) {
      if(err) {
        return res.status(401).send({err: 'Invalid Token.'});
      }
      req.user = user;
      next();
    });
  }
}

module.exports = verify;

