var express = require('express');
var router = express.Router();
var config = require('../config')
var PostsModel = require('../models/PostsModel')
var Session = require('../lib/Session');

router.post('/get', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data && decoded.data.alias && decoded.data.alias._id) {
      req.body.alias_id = decoded.data.alias._id;
    }
    PostsModel.getAllPostsByCondition(req.body, function (data) {
      if (data) {
        return res.json({response: data});
      } else {
        return res.json({
          error: {
            message: [{
              msg: 'An unexpected error happened, please try again latter',
              type: 'warning'
            }]
          }
        })
      }
    });
  });
})

router.post('/comment', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {
      var alias_id = null
      if (decoded.data.alias && decoded.data.alias._id) {
        alias_id = decoded.data.alias._id;
      }
      PostsModel.comment(alias_id, req.body.post_id, req.body.message, function (response,notice) {
        return res.json({response:response,notice:notice});
      })
    } else {
      return res.json({error: {message: [{msg: 'Please login first', type: 'warning'}]}});
    }
  });
})

router.post('/delete', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {
      var aliasId = 0;
      if (decoded.data.alias) {
        aliasId = decoded.data.alias._id
      }
      PostsModel.delete(req.body.id, decoded.data._id, aliasId, function (data) {
        if (data && !data.error) {
          data.deleted_post = req.body.id;
          return res.json(data);
        } else {
          return res.json(data)
        }
      });
    } else {
      return res.json({error: {message: [{msg: 'You are not authorized', type: 'warning'}]}, status: 'session_expired'})
    }
  })
})

router.get('/get/detail/:id', function (req, res) {
  var data = {}
  PostsModel.getPost(req.params.id, function (doc) {
    if (doc) {
      return res.json(doc);
    } else {
      return res.json({
        error: {
          message: [
            {msg: 'Could not find the post you are looking for', status: 'warning'}
          ]
        }
      });
    }

    //if(doc && doc.type == 'facebook'){
    //  res.render('elements/post-detail/image',{data:data});
    //} else {
    //  res.render('elements/post-detail/video',{data:data});
    //}

  })

})

router.get('/get-votes/:id', function (req, res) {
  PostsModel.getPostVote(req.params.id, function (data) {

    if (data) {
      return res.json({response: data});
    } else {
      return res.json({
        error: {
          message: [{
            msg: 'An unexpected error happened, please try again latter',
            type: 'warning'
          }]
        }
      })
    }
  });
})

router.post('/up-vote/:id', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {

      PostsModel.upVote(req.params.id, decoded.data._id, function (data,notification) {
        if (data && !data.error) {
          return res.json({response: data,notice:notification});
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

router.post('/down-vote/:id', function (req, res) {
  Session.decode(req.token, function (decoded) {
    if (decoded && decoded.data) {
      PostsModel.downVote(req.params.id, decoded.data._id, function (data) {
        if (data && !data.error) {
          return res.json({response: data.value});
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
