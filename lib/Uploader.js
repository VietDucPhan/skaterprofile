/**
 * Created by Administrator on 6/2/2015.
 * Helper for image uploader
 */
var config = require('../config');
var Model = require('../lib/Model');
var multer = require('multer');
var async = require('async');
var imageUploader;
var limitSize = 1000000;
var fs = require('fs');
var I = module.exports = {};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log(file)
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Model.guid() + "_" + Date.now() + "_" + file.originalname)
  }
})

var fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    return cb(null, true);
  }
  return cb(null, false)
}

imageUploader = multer({
  storage: storage,
  fileFilter: fileFilter
});

I.uploadSingleImage = function (inputName, req, res, callback) {
  imageUploader.single(inputName)(req, res, function (err) {
    async.waterfall([function (callback) {
      if (req.file) {
        callback(null, req.file);
      } else {
        callback(true, {msg: 'File type is not supported', type: 'danger'})
      }
    },
      function (file, callback) {
        if (file.size < limitSize) {
          callback(null, req.file);
        } else {
          fs.unlink(file.path, function () {
            callback(true, {msg: 'File size is too big', type: 'danger'})
          })
        }
      }
    ], function (err, response) {
      if (err) {

        return callback(err, response);
      } else {
        return callback(err, {msg: 'File upload successfully', type: 'success'})
      }
    })
  })
}