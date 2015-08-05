var express = require('express');
var router = express.Router();
var config = require('../config')
var PostsModel = require('../models/PostsModel')


router.post('/get',function(req,res){
  PostsModel.getAllPosts();
  res.json(req.body);
})
//export all routes
module.exports = router;
