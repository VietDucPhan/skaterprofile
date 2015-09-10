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

  socket.on('vote_action', function (data) {
    $rootScope.$broadcast('vote_action', data)
  })

  socket.on('notification', function (data) {
    if($rootScope.notifications){
      $rootScope.notifications.push(data)
    } else {
      $rootScope.notifications = [];
      $rootScope.notifications.push(data)
    }

    $rootScope.$broadcast('notification','some data')

  })

  socket.on('added_a_comment', function (data) {
    $rootScope.$broadcast('added_a_comment', data)
  })

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