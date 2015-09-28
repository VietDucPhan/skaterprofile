var express = require('express');
var router = express.Router();
var Session = require('../lib/Session');
/* GET home page. */
router.get('/', function(req, res) {
    res.render('layout');
});
/* GET home page. */
router.get('/users/activate', function(req, res) {
    res.render('layout');
});
/* GET home page. */
router.get('/users/login', function(req, res) {
  res.render('layout');
});

/* GET home page. */
router.get('/users/email-reset-password/:id', function(req, res) {
  res.render('layout');
});
/* GET home page. */
router.get('/users/setting/:param', function(req, res) {
  res.render('layout');
});
/* GET home page. */
router.get('/:users', function(req, res) {
  res.render('layout');
});
/* GET home page. */
router.get('/post/detail/:id', function(req, res) {
  res.render('layout');
});

/* GET home page. */
router.get('/users/create-profile', function(req, res) {
  res.render('layout');
});

/* GET home page. */
router.get('/post/:id', function(req, res) {
  res.render('layout');
});

/* GET home page. */
router.get('/profile/:acc/edit', function(req, res) {
  res.render('layout');
});
module.exports = router;