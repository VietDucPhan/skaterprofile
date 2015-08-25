var express = require('express');
var router = express.Router();
var config = require('../config')
var PostsModel = require('../models/PostsModel')
var Session = require('../lib/Session');

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
  var data = {}
  PostsModel.getPost(req.params.id,function(doc){
    if(doc){
      data = doc;
    }
    if(doc && doc.type == 'facebook'){
      res.render('elements/post-detail/image',{data:data});
    } else {
      res.render('elements/post-detail/video',{data:data});
    }

  })

})

router.get('/get-votes/:id',function(req,res){
  PostsModel.getPostVote(req.params.id,function(data){

    if(data){
      return res.json({response:data});
    } else {
      return res.json({error:{message:[{msg:'An unexpected error happened, please try again latter',type:'warning'}]}})
    }
  });
})

router.post('/up-vote/:id',function(req,res){
  Session.decode(req.token, function (decoded) {
    if(decoded && decoded.data){
      PostsModel.upVote(req.params.id, decoded.data._id, function (data) {
        if (data && !data.error) {
          return res.json({response:data.value});
        } else {
          return res.json(data)
        }
      });
    } else {
      return res.json({
        error: {
          message: [{
            msg: 'Please login first',
            type: 'warning'
          }]
        }
      })
    }

  });
})

router.post('/down-vote/:id',function(req,res){
  Session.decode(req.token, function (decoded) {
    if(decoded && decoded.data){
      PostsModel.downVote(req.params.id, decoded.data._id, function (data) {
        if (data && !data.error) {
          return res.json({response:data.value});
        } else {
          return res.json(data)
        }
      });
    } else {
      return res.json({
        error: {
          message: [{
            msg: 'Please login first',
            type: 'warning'
          }]
        }
      })
    }

  });
})
//export all routes
module.exports = router;
