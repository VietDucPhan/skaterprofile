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

AliasModel.getSkaterAlias = function(adminId, callback){
  var Alias = AliasModel.getCollection();
  Alias.findOne({"admin":new ObjectID(adminId)},function(err,doc){
    return callback(doc);
  });
}

AliasModel.createSkaterAlias = function (data, callback) {
  async.waterfall([function (callback) {
    data.type = 'user';
    if(data._id){
      data._id = new ObjectID(data._id);
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
          callback(true,{msg:"Username must longer than 6 characters",type:'danger'})
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
          callback(true,{msg:"Congratulation, you have successfully created a profile",type:'success'})
        }
      } else {
        callback(true,{msg:"There is an error occured, Please try again latter",type:'warning'})
      }
    });

  }], function (err,msg) {
    if(err){
      return callback({error:{message:[msg]}});
    } else {
      return callback({message:[msg],data:data})
    }

  })
}