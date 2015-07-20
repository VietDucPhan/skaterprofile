/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var Email = require('../lib/Email');
var async = require('async');
var Auth = require('../lib/Auth');


var AliasModel = module.exports = {};

AliasModel.getCollection = function () {
  return AppModel.db.collection('alias');
};


AliasModel.createSkaterAlias = function (data, callback) {
  async.waterfall([function (callback) {
    Validate.isValidUsername(data.username, function (flag) {
      if (!flag) {
        callback(true,{msg:'Username is not valid, please try again'})
      } else {
        callback(null,{})
      }
    })
  }, function (err,callback) {
      Validate.isUsernameExist(data.username, function (flag) {
        if (flag) {
          callback(true,{msg:"Username already existed, Please choose another one"})
        } else {
          callback(null,{})
        }
      })
    }], function (err,msg) {
    if(err){
      return callback({error:{message:[msg]}});
    } else {
      return callback({type:'success'})
    }

  })
}