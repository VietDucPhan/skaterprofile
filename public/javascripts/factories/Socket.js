angular.module('App').factory('Socket', function ($http, Auth, Session , $window, $rootScope) {
    var Socket = {};
    var LoggedIn = Auth.isAuthenticated();

    if (!LoggedIn) {
        return null;
    }

    var socket = io.connect();

    socket.emit('token',Session.get());

    Socket.emit = function (name, data) {
        socket.emit(name, data)
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