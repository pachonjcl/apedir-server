var express = require('express');
var dbService = require('../../db/service');
var run = require('../../db/run');
var verify = require('../../utils/verify');
var router = express.Router();
var axios = require('axios');

router.use(verify);

router.post('/subscribe', function(req, res) {
  var notificationToken = req.body.notificationToken;
  let topicName = 'purchases';
  var serverKey = 'AAAA6k9b6T4:APA91bG1gMZ-NwgqD7xnD7sg8-YPPIXPtRgIbMROaZn91twO9V4RkLg49BIHXvHJyp4wAqoJ7jD7SVC0LL3sXhhJDmyDnp2gOmq06UamLpIgqnWN2UswhqIAsXwUTZg0GGE7L13RKIS7';
  var url = `https://iid.googleapis.com/iid/v1/${notificationToken}/rel/topics/${topicName}`;
  axios.post(url, {}, {
    headers: { Authorization: `key=${serverKey}` }
  })
  .then(res => {
    res.send({ status : 'OK' });
  })
  .catch(err => {
    res.status(500).send({ err });
  });
});

module.exports = router;
