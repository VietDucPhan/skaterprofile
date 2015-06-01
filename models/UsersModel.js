/**
 * Created by Administrator on 5/29/2015.
 */
var AppModel = require('./AppModel');
var bcrypt = require('bcrypt');
module.exports = function () {
  this.collection = AppModel.db.collection('users');
  this.err = null;
  this.save = function(data, callback){
    this.collection.insert(data);
    if(typeof callback == 'function'){
      return callback('abc')
    }
  }
};