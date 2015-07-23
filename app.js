var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('./config');
var jwt = require('jsonwebtoken');
var Auth = require('./lib/Auth');
var Session = require('./lib/Session');


var home = require('./controllers/HomeController');
var users = require('./controllers/UsersController');
var ang = require('./controllers/AngController');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: config.session_secret,
  resave:false,
  store: new MongoStore({
    url: config.db_url,
    clear_interval: config.clear_expire_sessions
  }),
  saveUninitialized:false,
  cookie: { maxAge: config.lifetime }
}));
app.use(function(req, res, next) {
  req.token = req.body.token || req.query.token || req.headers['token'];

  Session.decode(req.token,function(decoded){
    app.locals.user = decoded.data
  })

  next();
});

app.use('/', home);
app.use('/ang', ang);
app.use('/api/users/', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('layout', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('layout', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
