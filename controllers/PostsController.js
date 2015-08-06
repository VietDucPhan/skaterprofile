var express = require('express');
var router = express.Router();
var config = require('../config')
var PostsModel = require('../models/PostsModel')


router.post('/get',function(req,res){
  PostsModel.getAllPosts(function(data){
    if(data){
      return res.json({response:data});
    } else {
      return res.json({error:{message:[{msg:'An unexpected error happened, please try again latter',type:'warning'}]}})
    }
  });

})
//export all routes
module.exports = router;
