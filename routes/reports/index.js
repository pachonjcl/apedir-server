var express = require('express');
var dbService = require('../../db/service');
var verify = require('../../utils/verify');
var router = express.Router();

router.use(verify);

router.get('/buy/:id', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`select w.purchase_id, p.name, sum(wp.quantity)
    from wish w
    join wish_product wp on wp.wish_id = w.wish_id
    join product p on p.product_id = wp.product_id
    where w.purchase_id = ${purchase_id}
    group by w.purchase_id, p.product_id
    order by w.purchase_id`)
  .then(function(rows) {
    res.send({rows})
  })
  .catch(function(err) {
    res.send({err})
  })
});

router.get('/wishes/:id', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`select w.purchase_id, w.wish_id, wp.quantity, p.name, p.unit_price * wp.quantity as total
from wish w
join wish_product wp on wp.wish_id = w.wish_id
join product p on p.product_id = wp.product_id
where w.purchase_id = ${purchase_id}
order by w.purchase_id`)
  .then(function(rows) {
    res.send({rows})
  })
  .catch(function(err) {
    console.log('err', err);
    res.send({err})
  })
});

module.exports = router;
