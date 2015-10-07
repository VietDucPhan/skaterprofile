angular.module('App').factory('Session', function ($http, $interval, $rootScope, $cacheFactory) {
  var Session = {};
  var refreshFirstTime = 1;
  var user;
  Session.set = function (data, callback) {
    //console.log(data);
    // $rootScope.$apply(function () {

    if (data.token) {
      localStorage.setItem('token', data.token);
      $http.defaults.headers.common.token = data.token;
    }

    console.info('Logged in user:', data.response);
    if (data && data.response) {
      $rootScope.user = data.response;
    }
    if (data && data.response && data.response.alias && data.response.alias._id ) {
      $rootScope.alias = data.response.alias;
    }
    if (data && data.response) {
      $rootScope.notifications = data.response.notifications;
    }

    if (typeof callback == 'function') {
      return callback();
    }
    //})

  };
  Session.get = function () {
    if (localStorage.getItem('token')) {
      return localStorage.getItem('token');
    }
    return false;
  };


  Session.refresh = function () {
    if (refreshFirstTime == 1) {
      Session._getNewToken();
      refreshFirstTime++;
    }
  }

  Session._getNewToken = function () {
    $http({
      method: 'POST',
      url: '/api/users/refresh',
      data: {token: Session.get()},  // pass in data as strings
      headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not
      // request payload)
    }).success(function (data) {
      //if token expired => destroy session in client
      if (!data.err) {
        Session.set(data, function () {
          return true;
        });
      } else {
        Session.destroy();
      }
    });
  }
  Session.destroy = function (callback) {
    localStorage.removeItem("token");
    $http.defaults.headers.common.token = null;
    $rootScope.alias = null;
    $rootScope.user = null;
    $rootScope.notifications = null;
    if (typeof callback == 'function') {
      return callback();
    }
    return true;
  };
  return Session;
})