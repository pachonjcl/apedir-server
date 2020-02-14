var express = require('express');
var dbService = require('../../db/service');
var verify = require('../../utils/verify');
var router = express.Router();

router.use(verify);

router.get('/:id/products', function(req, res) {
  console.log('/wishes/:id/products');
  var wish_id = req.params.id;
  dbService(`SELECT wp.wish_id, wp.quantity, p.*
    FROM wish_product wp
    JOIN product p ON p.product_id = wp.product_id
    WHERE wish_id = ${wish_id}`)
  .then(function(rows) {
    res.send({products: rows});
  })
  .catch(function(err) {
    res.send({err});
  });
});

router.get('/', function(req, res) {
  console.log('/');
  dbService('select * from wish')
  .then(function(rows) {
    console.log('then', rows);
    res.send({wishes: rows})
  })
  .catch(function(err) {
    console.log('err', err);
    res.send({err})
  })
});

module.exports = router;
