var express = require('express');
var router = express.Router();
var Session = require('../lib/Session');
/* GET home page. */
router.get('/elements/:folder/:element', function(req, res, next) {
    res.render('elements/' + req.params.folder + '/' + req.params.element);
});
/* GET home page. */
router.get('/users/:page', function(req, res, next) {
  res.render('users/' + req.params.page);
});

/* GET home page. */
router.get('/pages/:page', function(req, res, next) {

  res.render('pages/' + req.params.page);
});
module.exports = router;