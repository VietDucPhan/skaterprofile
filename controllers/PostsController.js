var express = require('express');
var router = express.Router();
var config = require('../config')
var PostsModel = require('../models/PostsModel')


router.post('/get',function(req,res){
  PostsModel.getAllPostsByCondition(req.body,function(data){
    if(data){
      return res.json({response:data});
    } else {
      return res.json({error:{message:[{msg:'An unexpected error happened, please try again latter',type:'warning'}]}})
    }
  });
})

router.get('/get/detail/:id',function(req,res){
  PostsModel.getPost(req.params.id,function(doc){
    if(doc && doc.type == 'facebook'){
      res.render('elements/post-detail/image',{data:doc});
    } else {
      res.render('elements/post-detail/video',{data:doc});
    }

  })

})
//export all routes
module.exports = router;
