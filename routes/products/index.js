var express = require('express');
var dbService = require('../../db/service');
var run = require('../../db/run');
var verify = require('../../utils/verify');
var router = express.Router();

router.use(verify);

router.get('/', function(req, res) {
  dbService('SELECT * FROM product')
    .then(function(rows) {
      return res.send({products: rows});
    })
    .catch(function(err) {
      return res.status(500).send({err});
    });
});

router.put('/:id', function(req, res) {
  let product = req.body;
  let product_id = req.params.id;
  let { name, unit_price } = product;
  run(`UPDATE product SET name = '${name}', unit_price = ${unit_price} where product_id = ${product_id}`)
    .then(function(status) {
      return res.send(status);
    })
    .catch(function(err) {
      return res.status(500).send({err});      
    });
})

module.exports = router;
