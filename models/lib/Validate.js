/**
 * Created by Administrator on 6/2/2015.
 * Helper for model before insert data to mongodb
 */
var bcrypt = require('bcrypt');
var AppModel = require('../AppModel');
var async = require('async');
var v = module.exports = {};
/**
 * Validate all user data, return safe data to store
 * @param data
 * @callback return error in arrays or null, safeData with data ready to be stored
 * @returns {}
 */
v.sanitizeUsers = function(data, callback){
  var safeData = {};
  var error = [];
  async.waterfall([
    function(callback){
      v.isEmail(data.email, function (flag, email) {
        if (!flag) {
          error.push('Please input a valid email');
        } else {
          //error = null;
          safeData.email = email;
        }

        callback(null, error, safeData);
      });
    },
    function(error, safeData, callback){
      v.isEmailExisted(safeData.email, function(flag,email){
        //console.log(flag);
        if(flag){
          error.push('Email already in used');
        }
        callback(null, error, safeData);
      });
    },
    function(error, safeData, callback){
      v.isValidPassword(data.password,function(flag,password){
        safeData.raw_password = password;
        if(!flag){
          error.push('Password must be more than 6 characters');
          callback(null, error, safeData);
        } else {
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(data.password, salt, function(err, hash) {
              safeData.password = hash;
              //there is a callback and no errors happen
              callback(null, error, safeData);
            });
          });
        }
      });
    }
  ],function(err,error,safeData){
    return callback(error,safeData);
  });


  //bcrypt.genSalt(10, function(err, salt) {
  //  bcrypt.hash(data.password, salt, function(err, hash) {
  //    safeData.password = hash;
  //    //there is a callback and no errors happen
  //    if(typeof callback == 'function' && error.length == 0){
  //      return callback(error,safeData);
  //    } else {
  //      return callback(error);
  //    }
  //  });
  //});

}
v.isEmail = function(email,callback){
  var EmailRegExp = /^([\w.-]+)\@([\w-]+)(\.([a-z]{2,3})){1,2}$/g;
  var flag = false;
  if(EmailRegExp.test(email)){
    flag = true;
  }

  if(typeof callback == 'function'){
    return callback(flag, email);
  }

  return flag;
}

v.isEmailExisted = function(email, callback){
  var users = AppModel.db.collection('users');
  var flag = false;
  users.find({email:email}).limit(1).toArray(function(err, explanation) {
    //console.log(explanation);
    if (explanation.length > 0) {
      flag = true;
    }

    if (typeof callback == 'function') {
      return callback(flag, email);
    }
    return flag;
  });
}

v.isValidPassword = function(password,callback){
  var flag = true;
  if(password.length < 6){
    flag = false;
  }

  if(typeof callback == 'function'){
    return callback(flag,password);
  }
  return flag;
}
