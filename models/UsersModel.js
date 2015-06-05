/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./AppModel');
var Validate = require('./lib/Validate');
var email = require('./lib/Email');

var UsersModel = module.exports = {};
UsersModel.getCollection = function(){
  return AppModel.db.collection('users');
}
UsersModel.save = function(data, callback){
  var users = this.getCollection();
  Validate.sanitizeUsers(data,function(err, res){
    email.sendEmail();
    if(err.length == 0){
      users.insert(res);
    }
    return callback(err);
  });

}