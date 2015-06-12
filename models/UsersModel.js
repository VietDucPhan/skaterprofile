/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./AppModel');
var Validate = require('./lib/Validate');
var email = require('./lib/Email');

var UsersModel = module.exports = {};

UsersModel.getCollection = function(){
  return AppModel.db.collection('users');
};

UsersModel.save = function(data, callback){
  var users = this.getCollection();
  Validate.sanitizeUsers(data,function(err, res){

    if(err.length == 0){
      //store and delete raw password to use latter
      var password = res.raw_password;
      delete res.raw_password;
      res.activate = AppModel.guid();
      users.insert(res,function(err, rec){
        //email data to send to register user
        var emailData = {
          template:'confirm',
          subject:'Welcome to Skaterprofile',
          password:password,
          email:rec.ops[0].email,
          activate_url: data.domain + '/users/activate/' + rec.ops[0].activate
        }

        email.sendEmail(emailData,function(err){
          if(typeof callback == 'function'){
            return callback(err);
          }
        });
      });
    } else {
      return callback(err);
    }

  });

};

UsersModel.edit = function(criteria,update,callback){
  var users = this.getCollection();
  if(typeof criteria == 'object' && typeof update == 'object'){
    users.update(criteria,update, function(err,rec){
      if(typeof callback == 'function'){
        return callback(err);
      }
      return err;
    });
  }

}