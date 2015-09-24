/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

var NotificationsModel = module.exports = {};

NotificationsModel.getAllUserNotification = function (alias_id, user_id, callback) {
  var notice = AppModel.db.collection('notifications');
  notice.find({
    $query: {
      $or: [
        {'post_data.posted_to_alias._id': new ObjectID(alias_id)},
        {'post_data.posted_by_alias._id': new ObjectID(alias_id)},
        {'follower_admin_id': new ObjectID(user_id)}
      ],
      $and: [
        {'alias._id': {$ne: new ObjectID(alias_id)}}
      ],
    },
    $orderby: {_id: -1}
  }).toArray(function (err, docs) {
    return callback(docs)
  })
}

NotificationsModel.set_all_to_read = function(user_id, callback){
  var notice = AppModel.db.collection('notifications');
  if(ObjectID.isValid(user_id)){
    var query = {
      $or:[
        {"post_data.posted_to_alias.admin": new ObjectID(user_id)},
        {"post_data.posted_by_alias.admin": new ObjectID(user_id)},
        {'follower_admin_id': new ObjectID(user_id)}
      ],
    }
    notice.update(query,{$set:{read:1}},{multi:true},function(err,res){
      return callback(res)
    })
  } else {
    return callback({error:{message:[{msg:"Unexpected errors happened please try again latter",type:'warning'}]}})
  }

}

NotificationsModel.addNotice = function (user_id, post_data, type, callback) {
  //var notice = AppModel.db.collection('notifications');
  //UserModel.getAllUserDataByUserId(user_id,function(user_data){
  //  notice.save({alias:user_data.alias,post_data:post_data,read:0,type:type},function(err,doc){
  //    console.log(doc);
  //    return callback(doc)
  //  })
  //})
}

