/**
 * Created by Administrator on 6/2/2015.
 * Helper for image uploader
 */
var config = require('../config');
var Model = require('../lib/Model');
var multer  = require('multer')

var I = module.exports = {};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log(file)
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Model.guid()+"_"+Date.now()+"_"+file.originalname)
  }
})

var fileFilter = function (req, file, cb){
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif'){
    return cb(null,true);
  }

  return cb(null,false)
}



I.singleUpload = multer({
  storage:storage,
  limits:{fileSize:1000000},
  fileFilter:fileFilter}).single('file');