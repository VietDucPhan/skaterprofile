/**
 * Created by Administrator on 5/29/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var config = require("../config");
var util = require('util');
var ObjectID = require('mongodb').ObjectID;

module.exports.init = function (server,callback) {
  MongoClient.connect(config.db_url, function(err, db){
    module.exports.db = db;

    if(typeof callback == 'function'){
      callback(err);
    }
  });
};

module.exports.guid = function(){
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  return s4() + s4() + '_' + s4() + '_' + s4() + '_' +
      s4() + '_' + s4() + s4() + s4();
}

module.exports.makeListObjectId = function(followers,callback){
  var val = []
  if(util.isArray(followers) && followers.length > 0){
    for(var i = 0, length = followers.length; i < length; i++){
      var followerId = followers[i]
      if(followerId && ObjectID.isValid(followerId)){
        val.push(new ObjectID(followerId))
      }
      if(i == length-1){
        return callback(val)
      }
    }
  } else {
    return callback(val)
  }
}