var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');
var Auth = require('../lib/Auth');
var Session = require('../lib/Session');
var AppModel = require('../lib/Model');
var config = require('../config')

/**
 * get data from sign up page process save data
 */
router.post('/refresh',function(req,res){
  Session.decode(req.token,function(decoded){
    console.log(decoded);
    Session.refresh(decoded,function(result){
      return res.json(result);
    })
  })

});

/**
 * get data from sign up page process save data
 */
router.post('/signup',function(req,res){
  Users.addNewUser({
    email:req.body.email,
    password:req.body.password,
    domain:req.protocol + '://' + req.headers.host},function(err){

    var jsonObj = {
      msg : err,
      success : true
    };
    if(err.length > 0){
      jsonObj.success = false;
    }
    console.log(jsonObj);
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
 * Facebook login
 */
router.post('/fblogin',function(req,res){
  var response = {
    req:req.body.a,
    status:false
  }
  return res.json(response);
});

router.get('/logout',function(req,res){
  res.redirect('/');
});

/**
 * Process login
 */
router.post('/login',function(req,res){
  var dateObj = new Date();

  Auth.auth(req.body.email, req.body.password, function(err,rec){
    var respond = {
      success:false
    };

    if(err.length == 0){
      delete rec.password;
      delete rec.activate;
      respond.success = true;
      Session.encode(rec,function(token){
        respond.token = token;
        respond.data = rec;
        return res.json(respond);
      });
    } else {
      respond.msg = err;
      console.log(respond);
      return res.json(respond);
    }
  });
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
