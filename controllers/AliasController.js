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
  console.log(req.body.id);
  Session.decode(req.token,function(decoded){
    console.log(decoded);
    return res.json({});
  })
})

router.post('/follow',function(req,res){
  Session.decode(req.token,function(decoded){
    console.log(decoded);
    return res.json({});
  })
})
module.exports = router;
