/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var Email = require('../lib/Email');
var async = require('async');
var Auth = require('../lib/Auth');
var CommentModel = require('../models/CommentsModel');
var ObjectID = require('mongodb').ObjectID;


var AliasModel = module.exports = {};

AliasModel.getCollection = function () {
  return AppModel.db.collection('alias');
};

AliasModel.getAlias = function (condition, callback) {
  var Alias = AliasModel.getCollection();
  Alias.findOne(condition, function (err, doc) {
    return callback(doc);
  });
}

AliasModel.getAllCompanies = function (callback) {
  var Alias = AliasModel.getCollection();

  Alias.find({type: 'company'}, {
    bio: 1,
    name: 1,
    username: 1,
    picture: 1
  }).sort({name: 1}).toArray(function (err, documents) {
    if (!err) {
      return callback({response: documents})
    } else {
      return callback({
        error: {
          message: [{
            msg: 'An unexpected error occured please try again latter',
            type: 'warning'
          }]
        }
      })
    }
  });
}

AliasModel.getAllTricks = function (callback) {
  var Alias = AliasModel.getCollection();

  Alias.find({type: 'trick'}, {
    name: 1,
    username: 1,
    picture: 1
  }).sort({name: 1}).toArray(function (err, documents) {
    if (!err) {
      return callback({response: documents})
    } else {
      return callback({
        error: {
          message: [{
            msg: 'An unexpected error occured please try again latter',
            type: 'warning'
          }]
        }
      })
    }
  });
}

AliasModel.getAllSpots = function (callback) {
  var Alias = AliasModel.getCollection();

  Alias.find({type: 'spot'}, {
    name: 1,
    username: 1,
    picture: 1
  }).sort({name: 1}).toArray(function (err, documents) {
    if (!err) {
      return callback({response: documents})
    } else {
      return callback({
        error: {
          message: [{
            msg: 'An unexpected error occured please try again latter',
            type: 'warning'
          }]
        }
      })
    }
  });
}

AliasModel.getAllProAm = function (callback) {
  var Alias = AliasModel.getCollection();

  Alias.find({type: 'skater', status: {$in: [1, 2]}}, {
    bio: 1,
    name: 1,
    sex: 1,
    stance: 1,
    status: 1,
    username: 1,
    picture: 1
  }).sort({name: 1}).toArray(function (err, documents) {
    if (!err) {
      return callback({response: documents})
    } else {
      return callback({
        error: {
          message: [{
            msg: 'An unexpected error occured please try again latter',
            type: 'warning'
          }]
        }
      })
    }
  });
}

AliasModel.getAliasInfoForPost = function (id, callback) {
  var Alias = AliasModel.getCollection();
  Alias.findOne({$or: [{admin: new ObjectID(id)}, {_id: new ObjectID(id)}]}, {
    _id: 1,
    name: 1,
    username: 1,
    picture: 1,
    admin: 1
  }, function (err, doc) {
    return callback(doc);
  });
}

AliasModel.isEditable = function (aliasId, userId, callback) {
  var editable = false;
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id: new ObjectID(aliasId)}, function (err, doc) {
    async.waterfall([
      function (callback) {
        for (var i = 0, lit = doc.managers ? doc.managers.length : 1; i < lit; i++) {
          if (doc && doc.managers && doc.managers[i] && doc.managers[i].toString() == userId) {
            callback(null)
            break;
          }

          if (i == lit - 1) {
            callback(true)
            break;
          }
        }
      }
    ], function (err) {
      if (doc && (!err || (doc.config && doc.config.public_editing == 1) || (doc.admin && doc.admin.toString() == userId))) {
        editable = true;
      }
      return callback(editable);
    })

  });
}

AliasModel.isPostable = function (aliasId, userId, callback) {
  var isPostable = false;
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id: new ObjectID(aliasId)}, function (err, doc) {
    async.waterfall([
      function (callback) {
        for (var i = 0, lit = doc.managers ? doc.managers.length : 1; i < lit; i++) {
          if (doc && doc.managers && doc.managers[i] && doc.managers[i].toString() == userId) {
            callback(null)
            break;
          }

          if (i == lit - 1) {
            callback(true)
            break;
          }
        }
      }
    ], function (err) {
      if (doc && (!err || (doc.config && doc.config.public_posting == 1) || (doc.admin && doc.admin.toString() == userId))) {
        isPostable = true;
      }
      return callback(isPostable);
    })
  });
}


AliasModel.removeFollowing = function (aliasId, idToRemove, callback) {
  var Alias = AliasModel.getCollection();
  Alias.update({
    _id: new ObjectID(aliasId),
    following: idToRemove
  }, {$pull: {following: idToRemove}}, function (err, doc) {
    if (doc.result.ok == 1) {
      Alias.findAndModify({_id: new ObjectID(idToRemove)}, [], {$inc: {followers: -1}}, {}, function (err, doc) {
      });
      return callback(true);
    } else {
      return callback(false);
    }
  });
}

AliasModel.removeFollower = function (aliasId, idToRemove, callback) {
  var Alias = AliasModel.getCollection();
  Alias.update({_id: new ObjectID(aliasId)}, {$pull: {'follower.id': idToRemove}}, function (err, doc) {
    if (doc.result.ok == 1) {

      return callback(true);
    } else {
      return callback(false);
    }

  });
}

AliasModel.getFollowing = function (alias_id, callback) {

  var Alias = AliasModel.getCollection();
  Alias.findOne({_id: new ObjectID(alias_id)}, function (err, doc) {
    console.log(alias_id);
    AppModel.makeListObjectId(doc.following, function (arrayObjectId) {

      Alias.find({_id: {$in: arrayObjectId}}).toArray(function (err, documents) {
        if (!err) {
          callback(documents)
        } else {
          callback({error: {message: [{msg: 'An unexpected error occured please try again latter', type: 'warning'}]}})
        }

      });
    })
  })

}


AliasModel.isFollowing = function (follower, following, callback) {
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id: new ObjectID(follower), 'following': {$in: [following]}}, function (err, doc) {
    return callback(doc);
  });
}


AliasModel.addFollowing = function (aliasId, anotherAliasId, callback) {
  var Alias = AliasModel.getCollection();
  var notice = AppModel.db.collection('notifications');
  Alias.findAndModify({_id: new ObjectID(aliasId)}, [], {$push: {following: anotherAliasId}}, {new: true}, function (err, doc1) {
    Alias.findAndModify({_id: new ObjectID(anotherAliasId)}, [], {$inc: {followers: 1}}, {new: true}, function (err, doc) {
      delete doc1.value.following;
      delete doc1.value.config;
      delete doc1.value.managers;
      notice.update({$and: [{follower_admin_id: doc.value.admin}, {"alias._id": new ObjectID(aliasId)}]},
        {
          $setOnInsert: {
            alias: doc1.value,
            read: 0,
            type: 'follow',
            created_date: new Date(),
            follower_admin_id: doc.value.admin
          }
        },
        {upsert: true}, function (err, doc) {
          if(doc && doc.result && doc.result.upserted && doc.result.upserted[0] && doc.result.upserted[0]._id){
            notice.findOne({_id: new ObjectID(doc.result.upserted[0]._id)},function(err, doc){
              return callback(doc)
            })
          } else if(err){
            return callback(false)
          } else {
            return callback(true)
          }
        })
    });
  });
}

AliasModel.updateProfile = function (condition, update, callback) {
  var Alias = AliasModel.getCollection();
  var Post = AppModel.db.collection('posts');
  Validate.isValidUsername(update.username, function (valid, text, errMsg) {
    if (valid) {
      Alias.findAndModify(condition, [], {$set: update}, {new: true}, function (err, rec) {
        if (!err) {
          var alias_data = rec.value;
          var update_data = {
            _id: alias_data._id,
            name: alias_data.name,
            username: alias_data.username,
            picture: alias_data.picture,
            admin: alias_data.admin
          }
          CommentModel.updateUserData(alias_data._id, update_data, function () {

          })

          Post.update({"posted_to_alias._id": alias_data._id},
            {
              $set: {
                posted_to_alias: update_data
              }
            },
            {multi: true},
            function (err, rec) {
            }
          )

          Post.update({"posted_by_alias._id": alias_data._id},
            {
              $set: {
                posted_by_alias: update_data
              }
            },
            {multi: true},
            function (err, rec) {
            }
          )
          if (typeof callback == "function") {
            return callback(rec);
          }
        } else {
          if (typeof callback == "function") {
            return callback(err);
          }
        }

      });
    } else {
      return callback(false, errMsg);
    }
  })

}

AliasModel.addAPost = function (condition, update, callback) {
  var Alias = AliasModel.getCollection();
  update._id = new ObjectID();
  update.created_time = new Date();
  Alias.findAndModify(condition, [], {$push: {posts: update}}, {new: true}, function (err, rec) {
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

AliasModel.createAlias = function (data, callback) {
  async.waterfall([function (callback) {
    if (data._id) {
      data._id = new ObjectID(data._id);
    }
    if (!data.username) {
      data.username = Validate.urlFriendly(data.name);
    }
    Validate.isValidUsername(data.username, function (flag) {
      if (!flag) {
        callback(true, {msg: 'Username is not valid, please try again', type: 'danger'})
      } else {
        callback(null, {})
      }
    })
  }, function (err, callback) {
    Validate.isUsernameExist(data.username, function (flag, explanation) {
      if (flag) {
        if (explanation._id.equals(data._id)) {
          callback(null, {})
        } else {
          callback(true, {msg: "Username already existed, Please choose another one", type: 'danger'})
        }

      } else {
        callback(null, {})
      }
    })
  }, function (err, callback) {
    var collection = AliasModel.getCollection();
    collection.save(data, function (err, status) {
      if (!err) {
        if (status.result.nModified == 1) {
          callback(null, {msg: "Profile was updated", type: 'success'})
        } else {
          callback(null, {msg: "Congratulation, you have successfully created a profile", type: 'success'})
        }
      } else {
        callback(true, {msg: "There is an error occured, Please try again latter", type: 'warning'})
      }
    });

  }], function (err, msg) {
    if (err) {
      return callback({error: {message: [msg]}});
    } else {
      return callback({message: [msg], response: data})
    }

  })
}