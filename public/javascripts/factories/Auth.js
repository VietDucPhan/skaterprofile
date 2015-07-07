angular.module('App').factory('Auth', function ($http, Session, $window ,$rootScope) {
    var Auth = {};

    Auth.login = function (credentials) {
        return $http({
            method: 'POST',
            url: '/api/users/login',
            data: credentials,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            if(data.success){
                Session.set(data.token,function(){
                    return $window.location.href = '/';
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
        if(Session.destroy()){
            return $window.location.href = '/';
        }
    }
    return Auth;
});