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
module.exports = router;
