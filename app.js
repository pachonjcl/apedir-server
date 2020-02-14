var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var routes = require('./routes');
var app = express();
var io = require('./ws');
var fileUpload = require('express-fileupload')

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
}));

app.use(cors());
app.use(bodyParser.json());

console.log(new Date());

app.use('', routes);

app.get('/status', function (req, res) {
  res.send({status: 'OK'});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
