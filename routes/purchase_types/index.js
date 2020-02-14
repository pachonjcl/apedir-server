var express = require('express');
var router = express.Router();
var verify = require('../../utils/verify');
var dbService = require('../../db/service');
var run = require('../../db/run');

router.use(verify);

router.get('/', function(req, res) {
  dbService(`SELECT pt.*, MIN(p.unit_price) as minPrice, MAX(p.unit_price) as maxPrice
    FROM purchase_type pt
    JOIN purchase_type_product ptp ON pt.purchase_type_id = ptp.purchase_type_id
    JOIN product p ON p.product_id = ptp.product_id
    GROUP BY pt.purchase_type_id;`)
  .then(rows => res.send({ purchase_types: rows }))
  .catch(err => res.status(500).send({err}));
});

router.get('/:id/products', function(req, res) {
  let id = req.params.id;
  dbService(`SELECT p.* FROM purchase_type pt
    JOIN purchase_type_product ptp ON ptp.purchase_type_id = pt.purchase_type_id
    JOIN product p ON p.product_id = ptp.product_id
    WHERE pt.purchase_type_id = ${id};`)
  .then(rows => res.send({ products: rows }))
  .catch(err => res.status(500).send({err}));
});

router.post('/:id/products', function(req, res) {
  let purchase_type_id = req.params.id;
  let product = req.body;
  let { name, unit_price } = product;
  run(`INSERT INTO product(name, unit_price) VALUES('${name}', ${unit_price})`)
  .then(function(status) {
    let product_id = status.lastID;
    return run(`INSERT INTO purchase_type_product(purchase_type_id, product_id)
      VALUES(${purchase_type_id}, ${product_id});`);
  })
  .then(function(status) {
    return res.send(status);
  })
  .catch(err => {
    res.status(500).send({err})
  });
});

module.exports = router;
