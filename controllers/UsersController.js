var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var os = require('os');
var Auth = require('../lib/Auth');
var Session = require('../lib/Session');
var AppModel = require('../lib/Model');
var config = require('../config')
var FB = require('../FB');
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var path = require('path');
var request = require('request');
var Image = require('../lib/Image');

/**
 * get data from sign up page process save data
 */
router.post('/refresh',function(req,res){
  Session.decode(req.token,function(decoded){
    console.log(process.env.SMTP_PASS);
    Session.refresh(decoded,function(result){
      return res.json(result);
    })
  })

});

router.post('/upload-picture',Image.singleUpload,function(req,res){
  return console.log(req.file);
  FB.setAccessToken(config.fb_access_token);
  var pageid = 'me',
    fburl = 'https://graph.facebook.com/'
      + pageid
      + '/photos?access_token='
      + config.fb_access_token,
    reqModule,
    form;

  reqModule = request.post(fburl, function(err, res, body) {
    FB.api()
  });
  form = reqModule.form()
// append a normal literal text field ...
  form.append('message', 'My photo!');

// append a file field by streaming a file from disk ...
  form.append('source', fs.createReadStream(path.join(__dirname, '..\\'+req.file.path)));

  res.json({});
})

/**
 * get data from sign up page process save data
 */
router.post('/create/profile',function(req,res){
  Session.decode(req.token,function(decoded){
    if(decoded){
      req.body.admin = new ObjectID(decoded.data._id);
      Users.createProfile(req.body,function(response){
        //console.log(response)
        res.json(response);
      })
    } else {
      res.json(
          {error: {
              message:[
                {msg:'Please login',type:'warning'}
              ]
            }
          })
    }
  })
});

/**
 * get data from sign up page process save data
 */
router.get('/profile',function(req,res){
  Session.decode(req.token,function(decoded){
    if(!decoded.tokenExp){
      Users.getProfileByAdmin(decoded.data._id,function(data){
        if(data){

          res.json(data);
        } else{

          res.json({error:{message:[{msg:'There are no matched profile',type:'warning'}]},status:'normal'});
        }
      })
    } else {
      res.json({error:{message:[{msg:'Session expired',type:'warning'}],status:'session_expired'}});
    }
  })
});

/**
 * get data from sign up page process save data
 */
router.post('/signup',function(req,res){
  var jsonObj = {message:[{msg:"Congratulation, you have successfully sign up. Please check your email to verify" +
  " your account",type:'success'}]};
  Users.addNewUser({
    email:req.body.email,
    password:req.body.password,
    domain:req.protocol + '://' + req.headers.host},function(err){

    if(err.length > 0){
      jsonObj= {error:{message:err}}
    }
    res.json(jsonObj);
  });
});

/**
 * Process activate users
 */
router.post('/activate',function(req,res){
  var jsonObj = {message:[{msg:"Congratulation, You have successfully activate your account",type:'success'}]};
  Users.update({activate:req.body.code},{$set:{activate:0}},function(err){
    if(!err){
      jsonObj = {error:{message:[{msg:"Activation failed, Please try again", type:'warning'}]}}
    }
    return res.json(jsonObj);
  });
});


/**
 * Facebook login
 */
router.post('/fblogin',function(req,res){
  console.log();
  FB.setAccessToken(req.body.accessToken);
  FB.api('/me?fields=email', function (response) {
    if(!response || response.error) {
      console.log(!response ? 'error occurred' : response.error);
    }
    return res.json(response);
  });

});

/**
 * add Facebook user
 */
router.post('/addfbuser',function(req,res){
  data = {};
  FB.setAccessToken(req.body.accessToken);
  FB.api('/me', function (response) {
    if(!response || response.error) {
      console.log(!response ? 'error occurred' : response.error);
      return res.json(response);
    }

    return res.json(response);
    data.socialID = response.id;
    data.social_link = response.link;
    data.name = response.name;
    data.locale = response.locale;
    Users.addFacebookUser(data,function(respond){
      return res.json(respond);
    })

  });

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
