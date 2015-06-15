var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');

/**
 * Show user profile
 */
router.get('/', function(req, res, next) {
  res.render('users/users', { title: 'general' });
  
});


/**
 * Show sign up page
 */
router.get('/signup', function(req, res, next) {
  console.log(req.protocol + '://' + req.headers.host);
  res.render('users/signup', { title: 'Sign up' });
});

/**
 * get data from sign up page process save data
 */
router.post('/signup',function(req,res){
  Users.save({
    email:req.body.email,
    password:req.body.password,
    domain:req.protocol + '://' + req.headers.host},function(err){
    //console.log(err);
    req.session.flash = err;
    res.redirect('/users/signup');
  });
});

/**
 * Process activate users
 */
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

/**
 * Show login page
 */
router.get('/login',function(req,res){
  res.render('users/login', { title: 'Login' });
});

/**
 * Show login page
 */
router.post('/login',function(req,res){

  Users.authenticate(
    req.body.username,
    req.body.password,
    function(err){
      if(err){

      }
    });
  res.render('users/login', { title: 'Login' });
});
/**
 * show users profile
 */
router.get('/:id', function(req, res, next) {
  res.render('users/users', { title: 'user profile' });

});
//export all routes
module.exports = router;
