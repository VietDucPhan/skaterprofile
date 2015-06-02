var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Sign up' });
});
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign up' });
});
router.post('/signup',function(req,res){
  Users.save({email:req.body.email,password:req.body.password},function(err){
    //console.log(err);
    res.render('signup', { title: 'Sign up',flash: err });
  });

});
module.exports = router;
