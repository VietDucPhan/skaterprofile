var express = require('express');
var router = express.Router();
var Users = require('../models/UsersModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users/users', { title: 'Sign up' });
  
});
router.get('/signup', function(req, res, next) {
  //console.log(process);
  res.render('users/signup', { title: 'Sign up' });
});
router.post('/signup',function(req,res){
  Users.save({email:req.body.email,password:req.body.password},function(err){
    console.log(err);
    req.session.flash = err;
    res.redirect('/users/signup');
  });

});
module.exports = router;
