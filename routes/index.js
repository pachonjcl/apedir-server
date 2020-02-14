var express = require('express');
var router = express.Router();
var login = require('./login/login');
var products = require('./products');
var wishes = require('./wishes');
var purchases = require('./purchases');
var users = require('./users');
var reports = require('./reports');
var purchase_types = require('./purchase_types');
var register = require('./register');
var notifications = require('./notifications');

router.use('/login', login);
router.use('/register', register);
router.use('/products', products);
router.use('/wishes', wishes);
router.use('/purchases', purchases);
router.use('/users', users);
router.use('/reports', reports);
router.use('/purchase_types', purchase_types);
router.use('/notifications', notifications);

module.exports = router;
