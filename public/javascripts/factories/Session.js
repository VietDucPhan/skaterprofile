angular.module('App').factory('Session', function ($http, $interval, $rootScope) {
  var Session = {};
  var refreshFirstTime = 1;
  Session.set = function (data, callback) {
    //console.log(data);
    // $rootScope.$apply(function () {
    localStorage.setItem('token', data.token);
    $http.defaults.headers.common.token = data.token;
    $rootScope.user = data.response;
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
        if (data.refreshed) {
          Session.set(data, function () {
            return true;
          });
        }
      } else {
        Session.destroy();
      }
    });
  }
  Session.destroy = function (callback) {
    localStorage.removeItem("token");
    $rootScope.user = null;
    if (typeof callback == 'function') {
      return callback();
    }
    return true;
  };
  return Session;
})