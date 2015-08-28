/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var Email = require('../lib/Email');
var async = require('async');
var Auth = require('../lib/Auth');
var ObjectID = require('mongodb').ObjectID;


var AliasModel = module.exports = {};

AliasModel.getCollection = function () {
  return AppModel.db.collection('alias');
};

AliasModel.getAlias = function(condition, callback){
  var Alias = AliasModel.getCollection();
  Alias.findOne(condition,function(err,doc){
    return callback(doc);
  });
}

AliasModel.isEditable = function(aliasId, userId, callback){
  var editable = false;
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id:new ObjectID(aliasId)},function(err,doc){
    async.waterfall([
      function(callback){
        for(var i = 0, lit = doc.managers ? doc.managers.length : 0; i < lit; i++){
          if(doc.managers[i] == userId){
            callback(null)
            break;
          }

          if(i == lit-1){
            callback(true)
            break;
          }
        }
      }
    ],function(err){
      if(doc && (!err || (doc.config && doc.config.public_editing == 1) || doc.admin.toString() == userId)){
        editable = true;
      }
      return callback(editable);
    })

  });
}

AliasModel.isPostable = function(aliasId, userId, callback){
  var editable = false;
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id:new ObjectID(aliasId)},function(err,doc){
    async.waterfall([
      function(callback){
        for(var i = 0, lit = doc.managers ? doc.managers.length : 0; i < lit; i++){
          if(doc.managers[i] == userId){
            callback(null)
            break;
          }

          if(i == lit-1){
            callback(true)
            break;
          }
        }
      }
    ],function(err){
      console.log(doc.admin == userId);
      if(doc && (!err || (doc.config && doc.config.public_posting == 1) || doc.admin.toString() == userId)){
        editable = true;
      }
      return callback(editable);
    })
  });
}

AliasModel.toggleFollow = function(actionSenderId,actionTakerId,callback){
  async.waterfall([function(callback){

  }],function(){

  })
}


AliasModel.removeFollowing = function(aliasId,idToRemove,callback){
  var Alias = AliasModel.getCollection();
  Alias.update({_id: new ObjectID(aliasId)},{$unset:{following:{ $in: [ {"id":idToRemove} ]}}},function(err,doc){
    if(doc.result.ok == 1){
      return callback(true);
    } else {
      return callback(false);
    }
  });
}

AliasModel.removeFollower = function(aliasId,idToRemove,callback){
  var Alias = AliasModel.getCollection();
  Alias.update({_id: new ObjectID(aliasId)},{$pull:{'follower.id':idToRemove}},function(err,doc){
    if(doc.result.ok == 1){
      return callback(true);
    } else {
      return callback(false);
    }

  });
}


AliasModel.isFollower = function(follower,following,callback){
  var Alias = AliasModel.getCollection();
  Alias.findOne({'followers.id':aliasId},function(err,doc){
    return callback(doc);
  });
}

AliasModel.isFollowing = function(follower,following,callback){
  var Alias = AliasModel.getCollection();
  Alias.findOne({_id:new ObjectID(follower),'following.id':following},function(err,doc){
    return callback(doc);
  });
}

AliasModel.addFollower = function(actionSenderId,actionTakerId,callback){
  var Alias = AliasModel.getCollection();
  Alias.findAndModify({_id: new ObjectID(actionSenderId)},[],{$push:{followers:actionTakerId}},{new:true},function(err,doc){
    return callback(doc);
  });
}

AliasModel.addFollowing = function(aliasId,anotherAliasId,callback){
  var Alias = AliasModel.getCollection();
  Alias.findAndModify({_id: new ObjectID(aliasId)},[],{$push:{following:{_id:new ObjectID(),id:anotherAliasId}}},{new:true},function(err,doc){
    return callback(doc);
  });
}

AliasModel.updateProfile = function(condition,update, callback){
  var Alias = AliasModel.getCollection();
  Alias.findAndModify(condition,[],{$set: update},{new:true},function(err,rec){
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

AliasModel.addAPost = function(condition,update, callback){
  var Alias = AliasModel.getCollection();
  update._id = new ObjectID();
  update.created_time = new Date();
  Alias.findAndModify(condition,[],{$push:{posts:update}},{new:true},function(err,rec){
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

AliasModel.createAlias = function (data, callback) {
  async.waterfall([function (callback) {
    if(data._id){
      data._id = new ObjectID(data._id);
    }
    if(!data.username){
      data.username = Validate.urlFriendly(data.name);
    }
    Validate.isValidUsername(data.username, function (flag) {
      if (!flag) {
        callback(true,{msg:'Username is not valid, please try again',type:'danger'})
      } else {
        callback(null,{})
      }
    })
  }, function (err,callback) {
      Validate.isUsernameExist(data.username, function (flag,explanation) {
        if (flag) {
          if(explanation._id.equals(data._id)){
            callback(null,{})
          } else {
            callback(true,{msg:"Username already existed, Please choose another one",type:'danger'})
          }

        } else {
          callback(null,{})
        }
      })
    }, function(err,callback){
      Validate.isValidPassword(data.username,function(flag){
        if(!flag){
          callback(true,{msg:"Username must longer than 6 and shorter than 24 characters",type:'danger'})
        } else {
          callback(null,{})
        }
      })

  },function(err,callback){
    var collection = AliasModel.getCollection();
    collection.save(data,function(err,status){
      if(!err){
        if(status.result.nModified == 1){
          callback(null,{msg:"Profile was updated",type:'success'})
        } else {
          callback(null,{msg:"Congratulation, you have successfully created a profile",type:'success'})
        }
      } else {
        callback(true,{msg:"There is an error occured, Please try again latter",type:'warning'})
      }
    });

  }], function (err,msg) {
    if(err){
      return callback({error:{message:[msg]}});
    } else {
      return callback({message:[msg],response:data})
    }

  })
}