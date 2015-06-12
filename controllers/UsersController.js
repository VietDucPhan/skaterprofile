var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users/users', { title: 'Sign up' });
  
});
router.get('/signup', function(req, res, next) {
  console.log(req.protocol + '://' + req.headers.host);
  res.render('users/signup', { title: 'Sign up' });
});
router.post('/signup',function(req,res){
  Users.save({email:req.body.email,password:req.body.password,domain:req.protocol + '://' + req.headers.host},function(err){
    //console.log(err);
    req.session.flash = err;
    res.redirect('/users/signup');
  });

});
router.get('/activate/:code',function(req,res,next){
  Users.edit({activate:req.params.code},{$set:{activate:0}},function(err){
    if(err){
      req.session.flash = ['Wrong activate code, Please try again'];
    } else {
      req.session.flash = ['Congratulation, Your account have been activated']
    }
    res.redirect('/users/login');
  });
});

router.get('/login',function(req,res){

});
module.exports = router;
