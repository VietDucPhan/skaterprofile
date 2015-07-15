var express = require('express');
var router = express.Router();
var Session = require('../lib/Session');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('layout');
});
module.exports = router;