/**
 * Created by Administrator on 5/29/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var config = require("../config");
var model = require('./lib/Validate');
module.exports.init = function (callback) {
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
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}