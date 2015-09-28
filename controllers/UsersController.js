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

router.post('/get-following', function (req, res) {
  Session.decode(req.token, function (decoded) {
    Session.refresh(decoded, function (result) {
      if(decoded && decoded.data){
        if(decoded.data && decoded.data.alias && decoded.data.alias._id){
          Alias.getFollowing(decoded.data.alias._id,function(data){
            return res.json({response:data});
          })
        } else {
          return res.json({response:[]});
        }

      } else {
        return res.json({error:{message:[{msg:'You need to login first',type:'warning'}]},status:'session_expired'});
      }
    })
  })

});


router.post('/set-notice-to-read', function (req, res) {
  Session.decode(req.token, function (decoded) {
    Session.refresh(decoded, function (result) {
      if(decoded && decoded.data){
        Users.set_notice_to_read(decoded.data._id, function(response){
          return res.json(response);
        })
      } else {
        return res.json({error:{message:[{msg:'You need to login first',type:'warning'}]},status:'session_expired'});
      }
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
      var msg = req.headers.desc ? req.headers.desc : 'Untitle';
      var to_alias = ObjectID.isValid(req.headers.to_alias) ? new ObjectID(req.headers.to_alias) : null;
      var by_user = new ObjectID(decoded.data._id);
      var by_alias = null;
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
                        Alias.getAliasInfoForPost(to_alias,function(doc){
                          fbPostResponse.posted_to_alias = doc;
                          Alias.getAliasInfoForPost(by_alias,function(doc){
                            fbPostResponse.posted_by_alias = doc;
                            fbPostResponse.name = req.headers.desc;
                            Users.postAPhoto(fbPostResponse,function(databaseResponse){
                              if(databaseResponse && databaseResponse.error){
                                return res.json(databaseResponse)
                              }
                              return res.json({response:{message:[{msg:'Successfully upload photo',type:'success'}],data:databaseResponse.ops[0]}});
                            })
                          })
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
              return res.json({error: {message: [{msg: 'You are not allowed to post to this profile', type: 'danger'}]}})
            }
          })
        } else {
          return res.json({error: {message: [{msg: 'We could not find the profile, you are posting to, please try again latter', type: 'danger'}]}})
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
                name:req.body.desc,
                posted_by_user:new ObjectID(decoded.data._id),
                posted_to_alias:to_alias,
                source:videoImage
              };
              if(decoded.data && decoded.data.alias){
                videoData.posted_by_alias = new ObjectID(decoded.data.alias._id);
              }
              Alias.getAliasInfoForPost(videoData.posted_to_alias,function(doc){
                videoData.posted_to_alias = doc;
                Alias.getAliasInfoForPost(videoData.posted_by_alias,function(doc){
                  videoData.posted_by_alias = doc;
                  Users.postAVideo(videoData,function(databaseResponse){
                    if(databaseResponse && databaseResponse.error){
                      return res.json(databaseResponse)
                    } else {
                      return res.json(databaseResponse);
                    }
                  })
                })
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
      respond.success = true;
      Users.getAllUserDataByUserId(rec._id,function(rec){
        Session.encode(rec, function (token) {
          respond.token = token;
          respond.response = rec;
          return res.json(respond);
        });
      })

    } else {
      respond.msg = err;
      return res.json(respond);
    }
  });
});

router.post('/email-reset-password', function (req, res) {
  console.log(req.body);
  Users.resetPassByRecoveryCode({
    code: req.body.code,
    password: req.body.password,
    repassword: req.body.repassword
  }, function (err) {
    if (err.length != 0) {
      return res.json({error:{message:[{msg:'An unexpected error happened please try again', type:'warning'}]}});
    } else {
      return res.json({error:{message:[{msg:'You can now login with new password', type:'success'}]}});
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
        return res.json({error:{message:err}})
      } else {
        return res.json({message:[{msg:'An instruction email has been sent to ' + req.body.email + ', please follow' +
        ' instruction  steps to recover your password. It might be late but it will come', type:'success'}]})
      }
    }
  );
});

//export all routes
module.exports = router;
