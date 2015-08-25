var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var Alias = require('../models/AliasModel');
var Auth = require('../lib/Auth');
var Validate = require('../lib/Validate');
var Session = require('../lib/Session');
var config = require('../config')
var ObjectID = require('mongodb').ObjectID;
var path = require('path');
var request = require('request');
var SNSApi = require('../lib/SNSApi');
var cheerio = require('cheerio')
/**
 * get data from sign up page process save data
 */
router.post('/refresh', function (req, res) {
  Session.decode(req.token, function (decoded) {
    Session.refresh(decoded, function (result) {
      return res.json(result);
    })
  })

});

/**
 * get data from sign up page process save data
 */
router.post('/change-password', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if(decoded && !decoded.tokenExp){
      Users.change_password(decoded.data._id,req.body.curr_pass,req.body.new_pass,req.body.new_pass2,function(changePassRes){
        if(changePassRes && changePassRes.error){
          return res.json(changePassRes)
        }
        return res.json(changePassRes)
      })
    } else {
      return res.json({error:{message:[{msg:'Your session expired, please login again',type:'danger'}]},status:'session_expired'})
    }
  })

});

router.post('/post-image',function(req,res){
  Session.decode(req.token, function (decoded) {
    if(decoded && !decoded.tokenExp){

      var msg = req.headers.msg ? req.headers.msg : 'Untitle';
      var to_alias = req.headers.to_alias ? new ObjectID(req.headers.to_alias) : null;
      var by_user = new ObjectID(decoded.data._id);
      var by_alias = null;
      var description = req.headers.desc ? req.headers.desc : null;
      if(decoded.data && decoded.data.alias){
        by_alias = new ObjectID(decoded.data.alias._id);
      }
      if(!to_alias){
        to_alias = by_user;
      }
      Users.getProfileByAdmin(to_alias,function(profile){
        if(profile){
          to_alias = profile._id;
          Alias.isPostable(to_alias, by_user, function(isPostable){
            if (isPostable) {
              SNSApi.postAnImageToFB('file',msg, req, function (fbUploadResponse) {
                if(fbUploadResponse && fbUploadResponse.error){
                  return res.json(fbUploadResponse);
                } else {
                  SNSApi.getFBPostDetailByID(fbUploadResponse.id,function (fbPostResponse) {
                    if (fbPostResponse && fbPostResponse.error) {
                      return res.json(fbPostResponse);
                    } else {
                      if(decoded && decoded.data && decoded.data._id){
                        fbPostResponse.posted_by_user = by_user;
                        fbPostResponse.posted_to_alias = to_alias;
                        fbPostResponse.posted_by_alias = by_alias;
                        fbPostResponse.description = description;
                        Users.postAPhoto(fbPostResponse,function(databaseResponse){
                          if(databaseResponse && databaseResponse.error){
                            return res.json(databaseResponse)
                          }
                          return res.json({response:{message:[{msg:'Successfully upload photo',type:'success'}]}});
                        })
                      } else {
                        return res.json({error:{message:[{msg:'An unexpected error happened, please try again latter',type:'warning'}],
                          status: 'session_expired'}})
                      }

                    }
                  })
                }
              })
            } else {
              return callback({error: {message: [{msg: 'You are not allowed to post to this profile', type: 'danger'}]}})
            }
          })
        } else {
          return callback({error: {message: [{msg: 'We could not find the profile, you are posting to, please try again latter', type: 'danger'}]}})
        }
      })


    } else {
      return res.json({error:{message:[{msg:'Session expired, please login again',type:'warning'}],
        status: 'session_expired'}})
    }
  })
})

router.post('/post-video',function(req,res){

  Session.decode(req.token, function (decoded) {
    if(decoded && !decoded.tokenExp){
      Validate.isVideo(req.body.video,function(flag,type){
        if(flag){
          Validate.getVideoId(req.body.video,type,function(videoId,videoImage){
            var to_alias = req.body.to_alias ? new ObjectID(req.body.to_alias) : null;
            if(videoId){
              var videoData = {
                video_id:videoId,
                url:req.body.video,
                type:type,
                name:req.body.title,
                posted_by_user:new ObjectID(decoded.data._id),
                posted_to_alias:to_alias,
                source:videoImage,
                description:req.body.desc
              };
              if(decoded.data && decoded.data.alias){
                videoData.posted_by_alias = new ObjectID(decoded.data.alias._id);
              }
              Users.postAVideo(videoData,function(databaseResponse){
                if(databaseResponse && databaseResponse.error){
                  return res.json(databaseResponse)
                } else {
                  return res.json({message:[{msg:'Successfully upload youtube.jade',type:'success'}]});
                }
              })
            } else {
              return res.json({error:{message:[{msg:'An unexpected error happened, please try again',type:'warning'}]}});
            }
          })
        } else {
          return res.json({error:{message:[{msg:'We only accept youtube and vimeo link',type:'danger'}]}});
        }
      })

    } else {
      return res.json({error:{message:[{msg:'Session expired, please login again',type:'warning'}],
        status: 'session_expired'}})
    }
  })
})


/**
 * get data from sign up page process save data
 */
router.post('/create/new-profile', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {
      var respond = {};
      req.body.managers = []
      req.body.managers.push(new ObjectID(decoded.data._id))
      Users.getProfileByAdmin(decoded.data._id,function(profile){
        if(req.body.isYourProfile == 1 && !profile){
          req.body.admin = new ObjectID(decoded.data._id);
        }
        delete req.body.isYourProfile;
        Users.createNewProfile(req.body, function (response) {
          if(req.body.admin && response && !response.error){
            decoded.data.alias = response.response;
            Session.encode(decoded.data,function(token){
              respond.token = token;
              respond.response = decoded.data;
              console.log(decoded.data);
              return res.json(respond);
            })
          } else {
            return res.json(response);
          }

        })
      })

    } else {
      res.json(
        {
          error: {
            message: [
              {msg: 'Please login', type: 'warning'}
            ]
          },
          type: 'session_expired'
        })
    }
  })
});

/**
 * get data from sign up page process save data
 */
router.post('/create/your-profile', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded) {
      req.body.admin = new ObjectID(decoded.data._id);
      Users.createProfile(req.body, function (response) {
        //console.log(response);
        res.json(response);
      })
    } else {
      res.json(
        {
          error: {
            message: [
              {msg: 'Please login', type: 'warning'}
            ]
          },
          type: 'session_expired'
        })
    }
  })
});

/**
 * get data from sign up page process save data
 */
router.get('/profile', function (req, res) {
  Session.decode(req.token, function (decoded) {

    if (!decoded.tokenExp) {
      Users.getProfileByAdmin(decoded.data._id, function (data) {
        if (data) {

          res.json({response: data});
        } else {

          res.json({error: {message: [{msg: 'There are no matched profile', type: 'warning'}]}, type: 'normal'});
        }
      })
    } else {
      res.json({error: {message: [{msg: 'Session expired', type: 'warning'}], type: 'session_expired'}});
    }
  })
});

/**
 * get data from sign up page process save data
 */
router.post('/signup', function (req, res) {
  var jsonObj = {
    message: [{
      msg: "Congratulation, you have successfully sign up. Please check your email to verify" +
      " your account", type: 'success'
    }]
  };
  Users.addNewUser({
    email: req.body.email,
    password: req.body.password,
    domain: req.protocol + '://' + req.headers.host
  }, function (err,errorMessage) {

    if (err) {
      return res.json({error:{message:[errorMessage]}});
    } else {
      return res.json(jsonObj);
    }

  });
});

/**
 * Process activate users
 */
router.post('/activate', function (req, res) {
  var jsonObj = {message: [{msg: "Congratulation, You have successfully activate your account", type: 'success'}]};
  Users.update({activate: req.body.code}, {$set: {activate: 0}}, function (err) {
    if (!err) {
      jsonObj = {error: {message: [{msg: "Activation failed, Please try again", type: 'warning'}]}}
    }
    return res.json(jsonObj);
  });
});


/**
 * Facebook login
 */
router.post('/fblogin', function (req, res) {
  console.log();
  FB.setAccessToken(req.body.accessToken);
  FB.api('/me?fields=email', function (response) {
    if (!response || response.error) {
      console.log(!response ? 'error occurred' : response.error);
    }
    return res.json(response);
  });

});

/**
 * add Facebook user
 */
router.post('/addfbuser', function (req, res) {
  data = {};
  FB.setAccessToken(req.body.accessToken);
  FB.api('/me', function (response) {
    if (!response || response.error) {
      console.log(!response ? 'error occurred' : response.error);
      return res.json(response);
    }

    return res.json(response);
    data.socialID = response.id;
    data.social_link = response.link;
    data.name = response.name;
    data.locale = response.locale;
    Users.addFacebookUser(data, function (respond) {
      return res.json(respond);
    })

  });

});

router.get('/logout', function (req, res) {
  res.redirect('/');
});

/**
 * Process login
 */
router.post('/login', function (req, res) {
  var dateObj = new Date();

  Auth.auth(req.body.email, req.body.password, function (err, rec) {
    var respond = {
      success: false
    };

    if (err.length == 0) {
      delete rec.password;
      delete rec.activate;
      respond.success = true;
      Session.encode(rec, function (token) {
        respond.token = token;
        respond.response = rec;
        return res.json(respond);
      });
    } else {
      respond.msg = err;
      return res.json(respond);
    }
  });
});


/**
 * Change password with provided code
 */
router.get('/email-reset-password/:code', function (req, res) {
  res.render('users/email-reset-password', {code: req.params.code});
});
router.post('/email-reset-password/:code', function (req, res) {
  Users.resetPassByRecoveryCode({
    code: req.body.code,
    password: req.body.password,
    repassword: req.body.repassword
  }, function (err) {
    if (err.length != 0) {
      req.session.flash = err;
      res.redirect('/users/email-reset-password/' + req.body.code);
    } else {
      req.session.flash = {template: 'success', message: ['You successfully changed password']};
      res.redirect('/users/login');
    }
  });
});

/**
 * recovery password process
 */
router.post('/recovery', function (req, res) {
  Users.requestRecoveryCode({email: req.body.email, domain: req.protocol + '://' + req.headers.host},
    function (err) {
      if (err.length != 0) {
        req.session.flash = err;
      }

      res.redirect('/users/recovery');
    }
  );
});

//export all routes
module.exports = router;
