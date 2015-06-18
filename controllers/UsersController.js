var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');
var Auth = require('../models/lib/Auth');
var AppModel = require('../models/AppModel');
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
  res.render('users/signup', { title: 'Sign up' });
});

/**
 * get data from sign up page process save data
 */
router.post('/signup',function(req,res){
  Users.addNewUser({
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
  Users.update({activate:req.params.code},{$set:{activate:0}},function(err){
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
  if(req.session.user){
    res.redirect('/');
  }
  res.render('users/login', { title: 'Login' });
});

/**
 * Process login
 */
router.post('/login',function(req,res){
  Auth.auth(req.body.email, req.body.password, function(err,rec){
    if(err.length == 0){
      delete rec.password;
      req.session.user = rec;
    } else {
      req.session.flash = err;
    }
    res.redirect('/users/login');
  });
});

/**
 * recovery password views
 */
router.get('/recovery',function(req,res){
  res.render('users/recovery');
});

/**
 * recovery password process
 */
router.post('/recovery',function(req,res){
  if(!req.session.recovery){
    Users.recovery({email:req.body.email,domain:req.protocol + '://' + req.headers.host},
        function(err){
          if(err.length != 0){
            req.session.flash = err;
          }

          res.redirect('/users/recovery');
        }
    );
  }


});
/**
 * show users profile
 */
router.get('/:id', function(req, res, next) {
  res.render('users/users', { title: 'user profile' });

});
//export all routes
module.exports = router;
