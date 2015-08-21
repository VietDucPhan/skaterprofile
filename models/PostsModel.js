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

PostsModel.getAllPostsByCondition = function(condition,callback){
  var Posts = AppModel.db.collection('posts');
  var query = {}
  if(condition.aliasId){
    query.posted_to_alias = new ObjectID(condition.aliasId)
  }
  var curs = Posts.find({$query:query,$orderby:{ _id: -1 }}).toArray(function(err, documents) {
    return callback(documents)
  });
  //Alias.aggregate([
  //
  //  {$group:{push_posts:{$push:'$posts'},
  //    _id:"$_id"}},
  //  { "$unwind": "$push_posts" },
  //  { "$unwind": "$push_posts" },
  //  {$project:{_id:1,push_posts:1}},
  //  {$sort:{'push_posts.created_time':-1}}
  //],{},function(err,cur){
  //  return callback(cur)
  //})
}

PostsModel.getPost = function(id,callback){
  var Posts = AppModel.db.collection('posts');
  Posts.findOne({_id:new ObjectID(id)},function(err,doc){
    return callback(doc)
  })
  //Alias.aggregate([
  //
  //  {$group:{push_posts:{$push:'$posts'},
  //    _id:"$_id"}},
  //  { "$unwind": "$push_posts" },
  //  { "$unwind": "$push_posts" },
  //  {$project:{_id:1,push_posts:1}},
  //  {$sort:{'push_posts.created_time':-1}}
  //],{},function(err,cur){
  //  return callback(cur)
  //})
}

PostsModel.save = function(data, callback){
  var Posts = AppModel.db.collection('posts');
  data.created_time = new Date();
  Posts.save(data, function(err,rec){
    if(!err){
      if(typeof callback == "function"){
        return callback(rec);
      }
    } else {
      if(typeof callback == "function"){
        return callback(err);
      }
    }

  });
}