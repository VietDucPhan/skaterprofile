var express = require('express');
var router = express.Router();
var Session = require('../lib/Session');
/* GET home page. */
router.get('/elements/:folder/:element', function(req, res, next) {
  Session.decode(req.token,function(decoded){
    data = null;
    if(decoded){
      data = decoded.data;
    }
    res.render('elements/' + req.params.folder + '/' + req.params.element,{user:data});
  })

});
/* GET home page. */
router.get('/users/:page', function(req, res, next) {
  res.render('users/' + req.params.page);
});

/* GET home page. */
router.get('/pages/:page', function(req, res, next) {

  res.render('pages/' + req.params.page);
});
module.exports = router;