var express = require('express');
var dbService = require('../../db/service');
var run = require('../../db/run');
var verify = require('../../utils/verify');
var router = express.Router();

router.use(verify);

router.get('/:id/logs', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`SELECT * FROM audit_wish_product WHERE purchase_id = ${purchase_id}`)
    .then(function(rows) {
      return res.send({logs: rows});
    })
    .catch(function(err) {
      return res.status(500).send({err});      
    });
});

router.post('/', function(req, res) {
  var body = req.body;
  var minutes = body.minutes;
  var purchase_type_id = body.purchase_type_id;
  var user_id = req.user.user_id;
  run(`INSERT INTO purchase(initiator_id, end_time, purchase_type_id) VALUES
      (${user_id}, 
        datetime('now', '-4 hours', '+${minutes} minutes'),
       ${purchase_type_id}
      )`)
  .then(s => res.status(201).send(s))
  .catch(err => res.status(500).send({err}));
});

router.get('/', function(req, res) {
  dbService('SELECT * FROM purchase')
    .then(function(rows) {
      return res.send({purchases: rows});      
    })
    .catch(function(err) {
      return res.status(500).send({err});      
    });
});

router.post('/:id/increase_time', function (req, res) {
  var purchase_id = req.params.id;
  var minutes = +req.body.minutes;
  if (minutes > 0) {
    run(`UPDATE purchase 
         SET end_time = datetime(end_time, '+${minutes} minutes') 
         WHERE purchase_id = ${purchase_id}`)
      .then(function (status) {
        return res.send(status);
      })
      .catch(function (err) {
        return res.status(500).send({ err });
      });
  } else {
    res.status(422).send({ err: 'Can\'t increase non positive minutes.' });
  }
});

router.get('/:id/wishes', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`SELECT * FROM wish WHERE purchase_id = ${purchase_id}`)
    .then(function(rows) {
      return res.send({wishes: rows});      
    })
    .catch(function(err) {
      console.log('err', err);
      return res.status(500).send({err});      
    });
});

router.get('/:id/users', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`SELECT * FROM user`)
    .then(function(rows) {
      return res.send({users: rows});      
    })
    .catch(function(err) {
      console.log('err', err);
      return res.status(500).send({err});      
    });
});

router.get('/:id/products', function(req, res) {
  var purchase_id = req.params.id;
  dbService(`SELECT pr.*
    FROM purchase p
    JOIN purchase_type_product ptp ON ptp.purchase_type_id = p.purchase_type_id
    JOIN product pr ON ptp.product_id = pr.product_id
    WHERE p.purchase_id = ${purchase_id}
  `)
    .then(function(rows) {
      return res.send({products: rows});      
    })
    .catch(function(err) {
      console.log('err', err);
      return res.status(500).send({err});      
    });
});

function getWishId(user_id, purchase_id) {
  return dbService(`SELECT DISTINCT w.wish_id
    FROM wish w
    JOIN wish_product wp ON wp.wish_id = w.wish_id
    WHERE w.user_id = ${user_id} and w.purchase_id = ${purchase_id}`);
}

function getWishProducts(wish_id) {
  return dbService(`select * 
    from wish_product 
    where wish_id = ${wish_id}`);
}

function checkPurchaseLimit(purchase_id) {
  return dbService(`select 
    strftime('%s', end_time) -
    strftime('%s',datetime('now', '-4 hours')) as remaining_time 
    from purchase 
    where purchase_id = ${purchase_id}`)
  .then(rows => rows[0].remaining_time);
}

function performUpdateAndCreate(toUpdate, toCreate) {
  var promises = [];
  toUpdate.forEach((tu) => {
    console.log(`
      UPDATE wish_product SET quantity = ${tu.quantity} WHERE product_id = ${tu.product_id} AND wish_id = ${tu.wish_id}
    `);
    promises.push(run(`
      UPDATE wish_product SET quantity = ${tu.quantity} WHERE product_id = ${tu.product_id} AND wish_id = ${tu.wish_id}
    `));
  });
  toCreate.forEach((tc) => {
    console.log(`
      INSERT INTO wish_product(quantity, product_id, wish_id)
      VALUES (${tc.quantity}, ${tc.product_id}, ${tc.wish_id})
    `);
    promises.push(run(`
      INSERT INTO wish_product(quantity, product_id, wish_id)
      VALUES (${tc.quantity}, ${tc.product_id}, ${tc.wish_id})
    `));
  });
  return Promise.all(promises);
}

function createWish(user_id, purchase_id) {
  return run(`
    INSERT INTO wish(user_id, purchase_id)
    VALUES (${user_id}, ${purchase_id})
  `)
  .then(function() {
    return dbService(`
      SELECT DISTINCT w.wish_id
      FROM wish w
      WHERE w.user_id = ${user_id} AND w.purchase_id = ${purchase_id}
    `)
  })
  .then(function(rows) {
    return rows[0].wish_id;
  });
}


router.post('/:id/wishes', function(req, res) {
  var user_id = req.user.user_id;
  var purchase_id = req.params.id;
  var newWishProducts = req.body.wishes;
  var wish_id;
  checkPurchaseLimit(purchase_id)
  .then((remaining_time) => {
    if(remaining_time > 0) {
      return getWishId(user_id, purchase_id);
    } else {
      throw new Error("Purchase time has passed.");
    }
  })
  .then(function(rows) {
    if(rows.length === 0) {
      return createWish(user_id, purchase_id);
    } else {
      return rows[0].wish_id;        
    }
  })
  .then(_wish_id => {
    wish_id = _wish_id;
    return getWishProducts(_wish_id);
  })
  .then(function(wishProducts) {
    var toUpdate = [];
    var toCreate = [];
    newWishProducts.forEach(nwp => {
      var found = false;
      wishProducts.forEach(wp => {
        if(wp.product_id === nwp.product_id) {
          found = true;
          if(wp.quantity !== nwp.quantity) {
            toUpdate.push({
              product_id: nwp.product_id,
              quantity: nwp.quantity,
              wish_id: wish_id
            })
          }
        }
      });
      if(!found && nwp.quantity > 0) {
        toCreate.push({
          product_id: nwp.product_id,
          quantity: nwp.quantity,
          wish_id: wish_id
        });
      }
    })
    performUpdateAndCreate(toUpdate, toCreate);
  })
  .then(() => {
    return res.send({status: 'OK'});
   })
  .catch(err => res.status(408).send({err: err.toString()}));
});

module.exports = router;
