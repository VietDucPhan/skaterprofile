/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./AppModel');
var Validate = require('./lib/Validate');
var emailTemplates = require('email-templates');

var UsersModel = module.exports = {};
UsersModel.getCollection = function(){
  return AppModel.db.collection('users');
}
UsersModel.save = function(data, callback){
  var users = this.getCollection();
  Validate.sanitizeUsers(data,function(err, res){
    console.log(err);
    if(err.length == 0){
      users.insert(res);
    }
    return callback(err);
  });

}