var express = require('express');
var router = express.Router();
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
  Alias.getAlias({username:req.params.alias},function(aliasData){
    if(aliasData){
      return res.json({response:aliasData});
    } else {
      return res.json({error:{message:[{msg:'Can\'t find what you are looking for'}]},status:'404'})
    }

  })
})

router.post('/isfollowing',function(req,res){
  Session.decode(req.token,function(decoded){
    if(decoded && decoded.data){
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

router.post('/follow',function(req,res){
  Session.decode(req.token,function(decoded){
    if(decoded && decoded.data){
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
      return res.json({error:{message:[{msg:'Please login first',type:'warning'}]},status:'session_expire'});
    }

  })
})
module.exports = router;
