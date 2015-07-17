var express = require('express');
var router = express.Router();
var Session = require('../lib/Session');
/* GET home page. */
router.get('/', function(req, res) {
    res.render('layout');
});
/* GET home page. */
router.get('/users/activate', function(req, res) {
    res.render('layout');
});
module.exports = router;