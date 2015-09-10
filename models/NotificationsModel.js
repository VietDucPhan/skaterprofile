/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

var NotificationsModel = module.exports = {};

NotificationsModel.getAllUserNotification = function(alias_id,callback){
  var notice = AppModel.db.collection('notifications');
  notice.find({
    $or:[
      {'post_data.posted_to_alias._id':new ObjectID(alias_id)},
      {'post_data.posted_by_alias._id':new ObjectID(alias_id)}
    ],
    $and:[
      {'alias._id': {$ne:new ObjectID(alias_id)}}
    ]
  }).toArray(function(err,docs){

    return callback(docs)
  })
}

NotificationsModel.addNotice = function(user_id,post_data,type,callback){
  //var notice = AppModel.db.collection('notifications');
  //UserModel.getAllUserDataByUserId(user_id,function(user_data){
  //  notice.save({alias:user_data.alias,post_data:post_data,read:0,type:type},function(err,doc){
  //    console.log(doc);
  //    return callback(doc)
  //  })
  //})
}

