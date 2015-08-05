/**
 * Created by Administrator on 8/5/2015.
 */
/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var async = require('async');
var Auth = require('../lib/Auth');
var ObjectID = require('mongodb').ObjectID;


var PostsModel = module.exports = {};

PostsModel.getAllPosts = function(){
  var Alias = AppModel.db.collection('alias');
  Alias.aggregate([
    {$group:{posts:'$posts'}}
  ],{},function(err,cur){
    console.info('error:',err);
    console.info('cursor:',cur);
  })
}
