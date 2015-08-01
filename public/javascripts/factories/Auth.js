angular.module('App').factory('Auth', function ($http, Session, $location ,$rootScope, Socket) {
    var Auth = {};
    var refreshFirstTime = 1;
    Auth.login = function (credentials,callback) {
        return $http({
            method: 'POST',
            url: '/api/users/login',
            data: credentials,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            if(data.success){
                Session.set(data,function(){
                    Socket.emit('token',data.token);
                    if(typeof callback == 'function'){
                        return callback([],true)
                    }
                });

            } else {
                return callback(data.msg)

            }
        });
    };

    Auth.isAuthenticated = function () {
        return !!Session.get();
    };

    Auth.logout = function(){
        Socket.emit('logout',{},function(){
            Session.destroy(function(){

                return $location.url('/');
            })
        });

    }
    return Auth;
});