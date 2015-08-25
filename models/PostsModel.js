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
var Socket = require('../lib/Socket');

var PostsModel = module.exports = {};

PostsModel.getAllPostsByCondition = function (condition, callback) {
  var Posts = AppModel.db.collection('posts');
  var query = {}
  if (condition.aliasId) {
    query.posted_to_alias = new ObjectID(condition.aliasId)
  }
  var curs = Posts.find({$query: query, $orderby: {_id: -1}}).toArray(function (err, documents) {
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

PostsModel.getPostVote = function (post_id, callback) {
  var Posts = AppModel.db.collection('posts');
  if (post_id) {
    Posts.findOne({_id: new ObjectID(post_id)}, function (err, doc) {
      if (doc) {
        return callback({up_votes: doc.up_votes, down_votes: doc.down_votes})
      } else {
        return callback({up_votes: [], down_votes: []});
      }
    })
  } else {
    return callback(false)
  }
}

PostsModel.upVote = function (post_id, user_id, callback) {
  var Posts = AppModel.db.collection('posts');
  if (post_id) {
    Posts.findOne({_id: new ObjectID(post_id)}, function (err, doc) {
      if (doc) {
        if (doc.down_votes && doc.down_votes.indexOf(user_id) != -1) {
          Posts.findAndModify({_id: doc._id}, [], {$pull: {down_votes: user_id}}, {new: true}, function (err, updatedDoc) {
          })
        }

        if (doc.up_votes && doc.up_votes.indexOf(user_id) != -1) {
          Posts.findAndModify({_id: doc._id}, [], {$pull: {up_votes: user_id}}, {new: true}, function (err, updatedDoc) {
            return callback(updatedDoc)
          })
        } else {
          Posts.findAndModify({_id: doc._id}, [], {$push: {up_votes: user_id}}, {new: true}, function (err, updatedDoc) {
            return callback(updatedDoc)
          })
        }

      } else {
        return callback({
          error: {
            message: [{
              msg: 'Post not found or was deleted',
              type: 'warning'
            }]
          }
        });
      }
    })
  } else {
    return callback(false)
  }
}

PostsModel.downVote = function (post_id, user_id, callback) {
  var Posts = AppModel.db.collection('posts');
  if (post_id) {
    Posts.findOne({_id: new ObjectID(post_id)}, function (err, doc) {
      if (doc) {
        if (doc.up_votes && doc.up_votes.indexOf(user_id) != -1) {
          Posts.findAndModify({_id: doc._id}, [], {$pull: {up_votes: user_id}}, {new: true}, function (err, updatedDoc) {
          })
        }

        if (doc.down_votes && doc.down_votes.indexOf(user_id) != -1) {
          Posts.findAndModify({_id: doc._id}, [], {$pull: {down_votes: user_id}}, {new: true}, function (err, updatedDoc) {
            return callback(updatedDoc)
          })
        } else {
          Posts.findAndModify({_id: doc._id}, [], {$push: {down_votes: user_id}}, {new: true}, function (err, updatedDoc) {
            return callback(updatedDoc)
          })
        }

      } else {
        return callback({
          error: {
            message: [{
              msg: 'Post not found or was deleted',
              type: 'warning'
            }]
          }
        });
      }
    })
  } else {
    return callback(false)
  }
}

PostsModel.getPost = function (id, callback) {
  var Posts = AppModel.db.collection('posts');
  Posts.findOne({_id: new ObjectID(id)}, function (err, doc) {
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

PostsModel.save = function (data, callback) {
  var Posts = AppModel.db.collection('posts');
  data.created_time = new Date();
  Posts.save(data, function (err, rec) {
    if (!err) {
      if (typeof callback == "function") {
        return callback(rec);
      }
    } else {
      if (typeof callback == "function") {
        return callback(err);
      }
    }

  });
}