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

PostsModel.getAllPosts = function(callback){
  var Alias = AppModel.db.collection('alias');
  Alias.aggregate([

    {$group:{push_posts:{$push:'$posts'},_id:'$_id'}},
    { "$unwind": "$push_posts" },
    { "$unwind": "$push_posts" },
    {$project:{_id:1,push_posts:1}}
  ],{},function(err,cur){
    return callback(cur)
  })
}
