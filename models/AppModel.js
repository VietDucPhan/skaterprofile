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