/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

var NotificationsModel = module.exports = {};

NotificationsModel.getAllUserNotification = function(alias_id,callback){
  var notice = AppModel.db.collection('notifications');
  notice.find({alias_id:alias_id}).toArray(function(err,docs){
    return callback(docs)
  })
}

