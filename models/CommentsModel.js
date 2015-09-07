/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var Email = require('../lib/Email');
var async = require('async');
var Auth = require('../lib/Auth');
var AliasModel = require('./AliasModel')
var PostsModel = require('./PostsModel');
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');

var CommentsModel = module.exports = {};

CommentsModel.getCollection = function () {
  return AppModel.db.collection('post_comments');
};

CommentsModel.getCommentsByPostId = function(id, callback){
  var comments = CommentsModel.getCollection();
  comments.find({post_id: new ObjectID(id)}).toArray(function (err, documents) {
    return callback(documents)
  });
}

CommentsModel.save = function(comment, callback){
  var comments = CommentsModel.getCollection();
  comment.created_time = new Date();
  comments.save(comment, function (err, rec) {
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
