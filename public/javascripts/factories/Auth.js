angular.module('App').factory('Auth', function ($http, Session, $location ,$rootScope, Socket) {
    var Auth = {};
    var refreshFirstTime = 1;
    Auth.login = function (credentials) {
        return $http({
            method: 'POST',
            url: '/api/users/login',
            data: credentials,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            if(data.success){
                Session.set(data,function(){
                    Socket.emit('token',data.token);
                    return $location.url('/');
                });

            } else {
                $rootScope.alerts = data.msg;
            }
        });
    };

    Auth.isAuthenticated = function () {
        return !!Session.get();
    };

    Auth.logout = function(){
        Session.destroy(function(){
            Socket.emit('disconnect');
            return $location.url('/');
        })
    }
    return Auth;
});