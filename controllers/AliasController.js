var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');
var Alias = require('../models/AliasModel');
var Auth = require('../lib/Auth');
var Session = require('../lib/Session');
var config = require('../config')
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var path = require('path');
var request = require('request');
var SNSApi = require('../lib/SNSApi');

router.get('/:alias',function(req,res){
  var condition = {username:req.params.alias};
  if(ObjectID.isValid(req.params.alias)){
    condition = {_id: new ObjectID(req.params.alias)};
  }
  Alias.getAlias(condition,function(aliasData){
    if(aliasData){
      return res.json({response:aliasData});
    } else {
      return res.json({error:{message:[{msg:'Can\'t find what you are looking for'}]},status:'404'})
    }

  })
})

router.post('/edit-profile', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {

      if(req.body && req.body.config && decoded.data._id != req.body.admin && req.body.managers.indexOf(decoded.data._id) == -1){
        delete req.body.config;
      }
      if(req.body && req.body.admin){
        delete req.body.admin
      }

      if(req.body && req.body.managers){
        delete req.body.managers
      }

      if(req.body && req.body.picture){
        delete req.body.picture
      }

      if(req.body && req.body.type){
        delete req.body.type
      }
      Alias.isEditable(req.body._id, decoded.data._id, function(isEditable){
        if(isEditable){
          var id = req.body._id;
          delete req.body._id;
          Alias.updateProfile({_id:new ObjectID(id)},req.body,function(respond){
            if(respond){
              return res.json({
                message:[
                  {msg: 'Profile was successfully updated', type: 'success'}
                ],
                response:respond.value
              })
            } else {
              return res.json(
                {
                  error: {
                    message: [
                      {msg: 'An unexpected error occurs please try again latter', type: 'warning'}
                    ]
                  },
                  type: 'unexpected'
                })
            }

          })
        } else {
          return res.json(
            {
              error: {
                message: [
                  {msg: 'You are not allowed to edit this profile', type: 'warning'}
                ]
              },
              type: 'auth_exception'
            })
        }
      })
    } else {
      return res.json(
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

router.post('/isfollowing',function(req,res){
  Session.decode(req.token,function(decoded){
    if(decoded && decoded.data && decoded.data.alias){
      Alias.isFollowing(decoded.data.alias._id,req.body.id,function(doc){

        if(doc){
          return res.json(true);
        } else {
          return res.json(false);
        }
      })
    } else {
      return res.json(false);
    }
  })
})

router.post('/change-picture', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data && decoded.data._id) {
      Users.getProfileByAliasId(req.headers.alias_id, function (profileData) {
        if (profileData) {
          Alias.isEditable(profileData._id, decoded.data._id, function(isEditable){
            if(isEditable){
              SNSApi.postAnImageToFB('file',profileData.username+" upload a profile picture", req, function (fbUploadResponse) {
                if(fbUploadResponse && fbUploadResponse.error){
                  return res.json(fbUploadResponse);
                }

                SNSApi.getFBPostDetailByID(fbUploadResponse.id,function (fbPostResponse) {
                  if (fbPostResponse && fbPostResponse.error) {
                    return res.json(fbPostResponse);
                  } else {
                    Users.updateProfilePicture(profileData._id, fbPostResponse, function (rec) {
                      decoded.data.alias.picture = rec
                      Session.encode(decoded.data, function (encoded) {
                        if(profileData.picture && profileData.picture.id){
                          SNSApi.deleteAPostOnFB(profileData.picture.id,function(){

                          })
                        }

                        return res.json({
                          token: encoded,
                          message: [{msg: 'Successfully update profile picture', type: 'success'}],
                          success: true,
                          response: decoded.data
                        });
                      })

                    })
                  }
                })
              });
            } else {
              return res.json({
                error: {
                  message: [{msg: "You are not allowed to edit this profile", type: 'danger'}],
                  status: 'auhorize_exception'
                }
              });
            }

          })

        } else {
          return res.json({
            error: {
              message: [{msg: "Please create profile first", type: 'danger'}],
              status: 'session_expired'
            }
          });
        }
      })
    } else {
      return res.json({
        error: {
          message: [{msg: "Session expired, Please login again", type: 'warning'}],
          status: 'session_expired'
        }
      });
    }
  })
})

router.post('/follow',function(req,res){
  Session.decode(req.token,function(decoded){
    if(decoded && decoded.data){
      if(decoded.data.alias && decoded.data.alias._id){
        Alias.isFollowing(decoded.data.alias._id,req.body.id,function(doc){
          if(!doc){
            Alias.addFollowing(decoded.data.alias._id,req.body.id,function(doc){
              if(doc){
                return res.json({message:[{msg:'You successfully followed this one',type:'success'}],status:'following'});
              } else {
                return res.json({error:{message:[{msg:'Something happened, please try again latter',type:'warning'}]}});
              }
            })
          } else {
            Alias.removeFollowing(decoded.data.alias._id,req.body.id,function(doc){
              if(doc){
                return res.json({message:[{msg:'You successfully unfollowed this one',type:'success'}],status:'follow'});
              } else {
                return res.json({error:{message:[{msg:'Something happened, please try again latter',type:'warning'}]}});
              }
            })
          }
        })
      } else {
        return res.json({error:{message:[{msg:'You need to create profile to follow someone',type:'warning'}]},status:'profile_missing'});
      }

    } else {
      return res.json({error:{message:[{msg:'Please login first',type:'warning'}]},status:'session_expire'});
    }

  })
})
module.exports = router;
