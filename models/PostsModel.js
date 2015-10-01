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
var AliasModel = require('./AliasModel');
var CommentsModel = require('../models/CommentsModel');
var PostsModel = module.exports = {};

PostsModel.getAllPostsByCondition = function (condition, callback) {
  var Posts = AppModel.db.collection('posts');
  var Alias = AppModel.db.collection('alias');
  var limit_number = 20;
  var query = {}
  if (condition.aliasId && !condition.following && !condition.hot) {
    Posts.find({
      $query: {_id: {$lt: new ObjectID(condition._id)},'posted_to_alias._id': new ObjectID(condition.aliasId)},
      $orderby: {_id: -1}
    }).limit(limit_number).toArray(function (err, documents) {
      return callback(documents)
    });
  } else if (condition.following && condition.alias_id) {
    Alias.findOne({_id: new ObjectID(condition.alias_id)}, function (err, doc) {
      if (doc && doc.following) {
        AppModel.makeListObjectId(doc.following, function (list) {
          list.push(new ObjectID(condition.alias_id));
          Posts.find({
            $query: {$and:
              [
                {_id: {$lt: new ObjectID(condition._id)}},
                {$or: [
                  {'posted_to_alias._id': {$in: list}},
                  {'posted_by_alias._id': {$in: list}}
                ]
                }
              ]},
            $orderby: {_id: -1}
          }).limit(limit_number).toArray(function (err, documents) {
            return callback(documents)
          });
        })
      } else {
        return callback([])
      }
    })
  } else {
    Posts.find({
      $query: {_id: {$lt: new ObjectID(condition._id)}},
      $orderby: {_id: -1}
    }).limit(limit_number).toArray(function (err, documents) {
      return callback(documents)
    });
  }

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

PostsModel.comment = function (alias_id, post_id, message, callback) {

  if (ObjectID.isValid(post_id) && message) {
    message.trim();
    var comment_data = {
      message: message,
      post_id: new ObjectID(post_id)
    }


    if (alias_id && ObjectID.isValid(alias_id)) {
      AliasModel.getAliasInfoForPost(alias_id, function (data) {
        comment_data.author = data;
        CommentsModel.save(comment_data, function (res) {
          if (res) {
            PostsModel.getPost(comment_data.post_id, function (doc) {
              var notice = AppModel.db.collection('notifications');
              notice.save({
                alias: data,
                post_data: doc,
                read: 0,
                type: 'comment',
                created_date: new Date()
              }, function (err, doc) {
                return callback(res.ops[0], doc.ops[0])
              })
            })
          } else {
            return callback({
              error: {
                message: [{
                  msg: "Could not save your comment, please try again",
                  type: 'warning'
                }]
              }
            })
          }
        })
      })
    } else {
      CommentsModel.save(comment_data, function (res) {
        if (res) {
          return callback({response: res})
        } else {
          return callback({error: {message: [{msg: "Could not save your comment, please try again", type: 'warning'}]}})
        }
      })
    }
  } else {
    return callback({
      error: {
        message: [{
          msg: "An unexpected error occured please try again latter, please try again",
          type: 'warning'
        }]
      }
    })
  }
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
            return callback(updatedDoc.value)
          })
        } else {
          Posts.findAndModify({_id: doc._id}, [], {$push: {up_votes: user_id}}, {new: true}, function (err, updatedDoc) {
            var notice = AppModel.db.collection('notifications');
            AliasModel.getAliasInfoForPost(user_id, function (alias) {
              notice.update({$and: [{"post_data._id": updatedDoc.value._id}, {"post_data.up_votes": user_id}]},
                {
                  $setOnInsert: {
                    alias: alias,
                    post_data: updatedDoc.value,
                    read: 0,
                    type: 'like',
                    created_date: new Date()
                  }
                },
                {upsert: true}, function (err, doc) {
                  //console.info('doc post model', doc.result);
                  if (doc && doc.result && doc.result.upserted) {
                    notice.findOne({_id: new ObjectID(doc.result.upserted[0]._id)}, function (err, doc) {
                      //console.info('doc post model', doc);
                      return callback(updatedDoc.value, doc)
                    })
                  } else {
                    return callback(updatedDoc.value)
                  }
                })
            })

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
  var Alias = AppModel.db.collection('alias');
  Posts.findOne({_id: new ObjectID(id)}, function (err, doc) {
    if (doc) {
      CommentsModel.getCommentsByPostId(id, function (data) {
        doc.comments = data;
        return callback(doc)
      })

    } else {
      return callback(false)
    }

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

PostsModel.delete = function (postId, userid, aliasId, callback) {
  var Posts = AppModel.db.collection('posts');
  var Comment = AppModel.db.collection('post_comments');
  Posts.findOne({
    _id: new ObjectID(postId),
    $and: [
      {
        $or: [
          {posted_by_user: new ObjectID(userid)},
          {'posted_to_alias._id': new ObjectID(aliasId)}
        ]
      }
    ]
  }, function (err, doc) {
    if (doc) {
      Posts.remove({_id: doc._id}, {}, function (err, num) {
        if (!err) {
          Comment.remove({post_id: doc._id}, function (err, num) {
          })
          return callback({message: [{msg: 'You successfuly delete a post', type: 'success'}]})
        } else {
          return callback({
            error: {
              message: [{
                msg: 'An unexpected error happened please try again later',
                type: 'danger'
              }]
            }, status: 'not_authorized'
          })
        }
      })
    } else {
      return callback({error: {message: [{msg: 'You are not authorized', type: 'danger'}]}, status: 'not_authorized'})
    }

  });
}

PostsModel.save = function (data, callback) {
  var Posts = AppModel.db.collection('posts');
  data.created_date = new Date();
  Posts.insert(data, function (err, rec) {
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