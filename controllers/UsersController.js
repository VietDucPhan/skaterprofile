var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');
var Auth = require('../lib/Auth');
var AppModel = require('../lib/Model');
var Socket = require('../lib/Socket');
var jwt = require('jsonwebtoken');
/**
 * Show sign up page
 */
router.get('/signup', function(req, res, next) {
  res.render('layout', { title: 'Sign up' });
});

/**
 * get data from sign up page process save data
 */
router.post('/signup',function(req,res){
  Users.addNewUser({
    email:req.body.email,
    password:req.body.password,
    domain:req.protocol + '://' + req.headers.host},function(err){
    console.log(err);
    var jsonObj = {
      errMessage : err,
      success : true
    };
    if(err.length > 0){
      jsonObj.success = false;
    }
    res.json(jsonObj);
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
      req.session.flash = ['Congratulation, Your account have been activated'];
    }
    res.redirect('/users/login');
  });
});


/**
 * Process login
 */
router.post('/login',function(req,res){
  Auth.auth(req.body.email, req.body.password, function(err,rec){
    var respond = {
      success:false
    }
    if(err.length == 0){
      respond.success = true;
      req.session.user = respond;
      respond.token = jwt.sign({ userid : rec._id }, req.session_secret);
      res.json(respond)
    } else {
      Socket.sendEmit('test','1')
      respond.msg = err;
      res.json(respond);
    }
  });
});


router.get('/logout',function(req,res){
  req.session.user = null;
  res.redirect('/');
});

/**
 * Change password with provided code
 */
router.get('/email-reset-password/:code',function(req,res){
  res.render('users/email-reset-password',{code:req.params.code});
});
router.post('/email-reset-password/:code',function(req,res){
  Users.resetPassByRecoveryCode({code:req.body.code,password:req.body.password,repassword:req.body.repassword},function(err){
    if(err.length != 0){
      req.session.flash = err;
      res.redirect('/users/email-reset-password/'+req.body.code);
    } else {
      req.session.flash = {template:'success',message:['You successfully changed password']};
      res.redirect('/users/login');
    }
  });
});

/**
 * recovery password process
 */
router.post('/recovery',function(req,res){
    Users.requestRecoveryCode({email:req.body.email,domain:req.protocol + '://' + req.headers.host},
        function(err){
          if(err.length != 0){
            req.session.flash = err;
          }

          res.redirect('/users/recovery');
        }
    );
});

/**
 * show users profile
 */
router.get('/:id', function(req, res, next) {
  res.render('users/users', { title: 'user profile' });

});
//export all routes
module.exports = router;
