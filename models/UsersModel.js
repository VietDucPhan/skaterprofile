/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Validate = require('../lib/Validate');
var Email = require('../lib/Email');
var async = require('async');
var Auth = require('../lib/Auth');
var AliasModel = require('./AliasModel')
var PostsModel = require('./PostsModel');
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');

var UsersModel = module.exports = {};

UsersModel.getCollection = function () {
  return AppModel.db.collection('users');
};

UsersModel.getProfileByAdmin = function (id, callback) {
  AliasModel.getAlias({
    $or: [
      {"admin": new ObjectID(id)},
      {"_id": new ObjectID(id)}
    ]
  }, function (response) {
    if (response) {
      return callback(response);
    } else {
      return callback(false);
    }

  })
};

UsersModel.getProfileByAliasId = function (AliasId, callback) {
  AliasModel.getAlias({"_id": new ObjectID(AliasId)}, function (response) {
    if (response) {
      return callback(response);
    } else {
      return callback(false);
    }

  })
};

UsersModel.getAllUserDataByUserId = function (UserId, callback) {
  var error = [];
  var users = AppModel.db.collection('users');
  var alias = AppModel.db.collection('alias');
  async.waterfall([function (callback) {
    users.findOne({_id: new ObjectID(UserId)}, function (err, rec) {
      if (rec == undefined) {
        error.push({msg: 'User not found!', type: 'warning'});
        callback(true, error);
      } else {
        delete rec.password;
        delete rec.activate
        callback(null, error, rec);
      }
    });
  },
    function (error, rec, callback) {

      alias.findOne({admin: new ObjectID(rec._id)}, function (err, response) {

        if (response) {
          rec.alias = response;

        }
        callback(null, error, rec);
      })
    }
  ], function (err, errorMessage, rec) {
    if (err) {
      return callback({error: {message: errorMessage}});
    } else {
      return callback(rec);
    }
  })

};

UsersModel.change_password = function (id, currPass, newPass, newPass2, callback) {
  var Users = UsersModel.getCollection();
  Users.findOne({_id: new ObjectID(id)}, function (err, res) {
    if (res) {
      if (newPass !== newPass2) {
        return callback({error: {message: [{msg: 'Your passwords not matched', type: 'danger'}]}});
      } else {
        Validate.isValidPassword(newPass, function (flag) {
          if (flag) {
            bcrypt.compare(currPass, res.password, function (err, res) {
              if (!err) {
                Auth.generatePassword(newPass, function (err, password) {
                  Users.update({_id: new ObjectID(id)}, {$set: {password: password}}, function (err) {
                    if (!err) {
                      return callback({
                        message: [{
                          msg: 'congratulation, you suscessfully updated your password',
                          type: 'success'
                        }]
                      });
                    } else {
                      return callback({
                        error: {
                          message: [{
                            msg: 'Something went wrong please try again',
                            type: 'danger'
                          }]
                        }
                      });
                    }
                  })
                })

              } else {
                callback({error: {message: [{msg: 'Not your password', type: 'danger'}]}});
              }
            });
          } else {
            return callback({
              error: {
                message: [{
                  msg: 'Password must greater than 6 and less than 24 characters',
                  type: 'danger'
                }]
              }
            });
          }
        })
      }

    } else {
      return callback({error: {message: [{msg: 'Something went wrong please try again', type: 'danger'}]}});
    }
  })
};

UsersModel.postAPhoto = function (photoData, callback) {
  PostsModel.save(photoData, function (response) {
    if (response) {
      return callback(response)
    } else {
      return callback({error: {message: [{msg: 'Something went wrong please try again', type: 'danger'}]}})
    }
  })
}

UsersModel.postAVideo = function (videoData, callback) {
  if (!videoData.posted_to_alias) {
    videoData.posted_to_alias = videoData.posted_by_user
  }
  this.getProfileByAdmin(videoData.posted_to_alias, function (res) {
    if (res) {
      videoData.posted_to_alias = res._id
      AliasModel.isPostable(res._id, videoData.posted_by_user, function (isPostable) {
        if (isPostable) {
          PostsModel.save(videoData, function (response) {
            if (response) {
              return callback(response)
            } else {
              return callback({error: {message: [{msg: 'Something went wrong please try agin', type: 'danger'}]}})
            }
          })
        } else {
          return callback({error: {message: [{msg: 'You are not allowed to post to this profile', type: 'danger'}]}})
        }
      })
    } else {
      return callback({
        error: {
          message: [{
            msg: 'We could not find the profile, you are posting to, please try again latter',
            type: 'danger'
          }]
        }
      })
    }
  })
}

UsersModel.updateProfilePicture = function (profileId, picture, callback) {
  AliasModel.updateProfile({_id: new ObjectID(profileId)}, {picture: picture}, function (rec) {
    if (typeof callback == 'function') {
      return callback(rec.value.picture);
    }
    return rec;
  })
}

UsersModel.createNewProfile = function (data, callback) {
  AliasModel.createAlias(data, function (response) {
    //console.log(response);
    return callback(response);
  })
};


UsersModel.createProfile = function (data, callback) {
  data.type = 'skater'
  AliasModel.createAlias(data, function (response) {
    //console.log(response);
    return callback(response);
  })
};


UsersModel.addNewUser = function (data, callback) {
  var users = this.getCollection();
  Validate.sanitizeUsers(data, function (err, error, res) {

    if (!err) {
      //store and delete raw password to use latter
      var password = res.raw_password;
      delete res.raw_password;
      res.activate = AppModel.guid();
      users.insert(res, function (err, rec) {
        //email data to send to register user
        var emailData = {
          template: 'confirm',
          subject: 'Welcome to Skaterprofile',
          password: password,
          email: rec.ops[0].email,
          activate_url: data.domain + '/users/activate/' + rec.ops[0].activate
        }

        Email.sendEmail(emailData, function (err) {
          if (typeof callback == 'function') {
            return callback(false);
          }
        });
      });
    } else {
      return callback(err, error);
    }

  });

};

UsersModel.addFacebookUser = function (data, callback) {
  var users = this.getCollection();
  users.insert(data, function (err, res) {
    if (!err) {

    } else {
      return callback([{msg: "Could not login, please remove our app on facebook and login again", type: 'warning'}]);
    }

  });
}

UsersModel.resetPassByRecoveryCode = function (data, callback) {
  var date = new Date();
  var users = this.getCollection();
  date.setDate(date.getDate());
  var currentDate = new Date(date.toISOString());
  var error = [];
  async.waterfall([
    function (callback) {
      Validate.isValidPassword(data.password, function (flag, password) {
        if (flag) {
          callback(null, error, password);
        } else {
          error.push('Please enter a valid password');
          callback(true, error)
        }
      })
    },
    function (error, password, callback) {
      if (password == data.repassword) {
        callback(null, error, password);
      } else {
        error.push("These passwords don't match, Please try again ");
        callback(true, error);
      }
    },
    function (error, password, callback) {
      Auth.generatePassword(password, function (err, hash) {
        callback(null, error, hash)
      });
    },
    function (error, hash, callback) {
      users.update({'recovery.code': data.code, 'recovery.expire': {$gte: currentDate}}, {
        $set: {
          password: hash,
          recovery: {}
        }
      }, function (err, rec) {
        if (rec.result.n == 0) {
          error.push('Your request code expired, Please request a new one');
          callback(true, error);
        } else {
          callback(null, error);
        }

      })
    }
  ], function (err, error) {
    if (typeof callback == 'function') {
      return callback(error);
    }
  })

}

UsersModel.requestRecoveryCode = function (data, callback) {
  var date = new Date(),
    users = this.getCollection(),
    error = [],
    numberOfDaysToAdd = 1;//could not reset password after 1 day

  date.setDate(date.getDate() + numberOfDaysToAdd);
  var expirationDate = new Date(date.toISOString());
  var resetCode = AppModel.guid();
  async.waterfall([
    function (callback) {
      Validate.isEmail(data.email, function (flag, email) {
        if (!flag) {
          error.push('Email is not valid');
          callback(true, error, email);
        } else {
          callback(null, error, email);
        }

      });
    },
    function (err, email, callback) {
      users.update(
        {email: email},
        {$set: {recovery: {code: resetCode, expire: expirationDate}}},
        function (err, count) {
          if (count.result.n == 0) {
            error.push('Account not found');
            callback(true, error);
          } else {
            callback(null, email, resetCode);
          }

        }
      );
    },
    function (email, resetCode, callback) {
      var emailData = {
        email: email,
        recovery_url: data.domain + '/users/email-reset-password/' + resetCode,
        template: "recovery",
        subject: "Password Recovery"
      };
      Email.sendEmail(emailData, function (err, message) {
        callback(null, error);
      });
    }
  ], function (err, error) {
    callback(error);
    //users.update(
    //    {email:email},
    //    {$set:{recovery:{code:AppModel.guid(),expire:expirationDate}}}
    //);
  });
}

UsersModel.update = function (criteria, update, callback) {
  var users = this.getCollection();
  if (typeof criteria == 'object' && typeof update == 'object') {
    users.update(criteria, update, function (err, rec) {
      if (typeof callback == 'function') {
        return callback(err, rec);
      }
      return err;
    });
  }
};

