angular.module('App').factory('Socket', function ($http, Session, $window, $rootScope) {
  var Socket = {};
  var LoggedIn = Session.get();
  var socket = io.connect();

  socket.emit('token', Session.get());
  Socket.emit = function (name, data, callback) {
    socket.emit(name, data);
    if (typeof callback == 'function') {
      return callback();
    }
  }

  Socket.listen = function (name, callback) {
    socket.on(name, function (data) {
      if (typeof callback == 'function') {
        $rootScope.$apply(function () {
          return callback(data);
        })

      }
    })
  }

  Socket.getAllOnlineUsers = function (callback) {
    socket.on('UsersOnline', function (data) {
      if (typeof callback == 'function') {
        $rootScope.$apply(function () {
          return callback(data);
        })

      }
    });
  }


  return Socket;

});