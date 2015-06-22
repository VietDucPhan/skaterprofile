/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./AppModel');
var Validate = require('./lib/Validate');
var Email = require('./lib/Email');
var async = require('async');

var UsersModel = module.exports = {};

UsersModel.getCollection = function(){
  return AppModel.db.collection('users');
};

UsersModel.addNewUser = function(data, callback){
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

        Email.sendEmail(emailData,function(err){
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

UsersModel.resetPassByRecoveryCode = function(data, callback){
  var date = new Date();
  var users = this.getCollection();
  date.setDate(date.getDate());
  var currentDate = new Date(date.toISOString());
  users.update({'recovery.code':data.code,'recovery.expire':{$gte:currentDate}},{$set:{abc:currentDate}},function(err){
    if(typeof callback == 'function'){
      return callback(err);
    }
  })
}

UsersModel.requestRecoveryCode = function(data,callback){
  var date = new Date(),
      users = this.getCollection(),
      error = [],
      numberOfDaysToAdd = 1;//could not reset password after 1 day

  date.setDate(date.getDate() + numberOfDaysToAdd);
  var expirationDate = new Date(date.toISOString());
  var resetCode = AppModel.guid();
  async.waterfall([
      function(callback){
        Validate.isEmail(data.email,function(flag,email){
          if(!flag){
            error.push('Email is not valid');
            callback(true,error,email);
          } else {
            callback(null,error,email);
          }

        });
      },
      function(err,email,callback){
        users.update(
            {email:email},
            {$set:{recovery:{code:resetCode,expire:expirationDate}}},
            function(err,count){
              if(count.result.n == 0){
                error.push('Account not found');
                callback(true,error);
              }else {
                callback(null, email, resetCode);
              }

            }
        );
      },
      function(email, resetCode, callback){
        var emailData = {
          email:email,
          recovery_url:data.domain + '/users/email-reset-password/' +  resetCode,
          template:"recovery",
          subject:"Password Recovery"
        };
        Email.sendEmail(emailData,function(err,message){
          callback(null,error);
        });
      }
  ],function(err,error){
    callback(error);
    //users.update(
    //    {email:email},
    //    {$set:{recovery:{code:AppModel.guid(),expire:expirationDate}}}
    //);
  });
}

UsersModel.update = function(criteria,update,callback){
  var users = this.getCollection();
  if(typeof criteria == 'object' && typeof update == 'object'){
    users.update(criteria,update, function(err,rec){
      if(typeof callback == 'function'){
        return callback(err,rec);
      }
      return err;
    });
  }
};

