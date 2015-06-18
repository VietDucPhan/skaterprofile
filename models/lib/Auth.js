/**
 * Created by Administrator on 6/2/2015.
 * Helper for model before insert data to mongodb
 */
var bcrypt = require('bcrypt');
var AppModel = require('../AppModel');
var async = require('async');
var A = module.exports = {};

A.auth = function(username,password,callback){
  var users = AppModel.db.collection('users');
  var error = [];
  async.waterfall([
    function(callback){
      users.findOne({email:username},function(err,rec){
        if(rec == undefined){
          error.push('User name not found!');
          callback(true,error);
        } else {
          callback(null, rec);
        }

      });
    },
    function(respond,callback){
      if(respond.activate == 0){
        callback(null, respond);
      } else {
        error.push('Please activate your account');
        callback(true,error);
      }
    },
    function(respond,callback){
      bcrypt.compare(password, respond.password, function(err, res) {
        if(res){
          callback(null,error,respond);
        } else {
          error.push('Wrong password!');
          callback(true,error);
        }

      });
    }
  ],function(err,errorMessage,record){
    if(typeof callback == 'function'){
      return callback(errorMessage,record);
    }
  });
}