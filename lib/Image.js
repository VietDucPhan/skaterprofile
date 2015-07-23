/**
 * Created by Administrator on 6/2/2015.
 * Helper for image uploader
 */
var config = require('../config');
var Model = require('../lib/Model');
var multer  = require('multer')


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Model.guid()+"_"+Date.now()+"_"+file.originalname)
  }
})

var fileFilter = function (req, file, cb){
  if(file.mimetype === 'image/jpeg'){
    cb(null,true);
  }

  cb(null,false)
}

var I = module.exports = {};

I.singleUpload = multer({storage:storage,limits:{fileSize:1000000},fileFilter:fileFilter}).single('file');