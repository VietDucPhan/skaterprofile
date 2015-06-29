var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/users/:page', function(req, res, next) {
  res.render('users/' + req.params.page);
});

/* GET home page. */
router.get('/pages/:page', function(req, res, next) {
  console.log('abc '+req.params.page)
  res.render('pages/' + req.params.page);
});
module.exports = router;