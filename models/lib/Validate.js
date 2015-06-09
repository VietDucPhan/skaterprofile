/**
 * Created by Administrator on 6/2/2015.
 * Helper for model before insert data to mongodb
 */
var bcrypt = require('bcrypt');
var AppModel = require('../AppModel');

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
  if(!this.isEmail(data.email)){
    error.push('Please input valid emails address');
  } else if(this.isEmailExisted(data.email)){
    error.push('Email already existed');
  } else  {
    safeData.email = data.email;
  }



  if(!this.isValidPassword(data.password)){
    error.push('Please input valid password');
  } else {
    safeData.raw_password = data.password;
  }


  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(data.password, salt, function(err, hash) {
      safeData.password = hash;
      //there is a callback and no errors happen
      if(typeof callback == 'function' && error.length == 0){
        return callback(error,safeData);
      } else {
        return callback(error);
      }
    });
  });

}
v.isEmail = function(email){
  var EmailRegExp = /^([\w.-]+)\@([\w-]+)(\.([a-z]{2,3})){1,2}$/g;
  var flag = false;
  if(EmailRegExp.test(email)){
    flag = true;
  }
  return flag;
}

v.isEmailExisted = function(email){
  var users = AppModel.db.collection('users');
  var flag = true;
  users.findOne({email:email},function(err,doc){
    return true;
  });


}

v.isValidPassword = function(password){
  var flag = true;
  if(password.length < 6){
    flag = false;
  }
  return flag;
}