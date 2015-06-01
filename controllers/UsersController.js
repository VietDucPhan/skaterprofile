var express = require('express');
var router = express.Router();
var User = require('../models/UsersModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var user = new User();
  user.save({a:asdf},function(err){
    console.log('abc');
  });
  res.send('respond with a resource');
});

module.exports = router;
