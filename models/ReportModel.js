/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./../lib/Model');
var Email = require('../lib/Email');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;


var ReportModel = module.exports = {};

ReportModel.getCollection = function () {
  return AppModel.db.collection('reports');
};

ReportModel.add = function (data, callback) {
  var report = ReportModel.getCollection();
  data.created_date = new Date();
  report.insert(data,[],function(err){
    if(err){
      return callback(true)
    } else {
      return callback(false)
    }

  })
};