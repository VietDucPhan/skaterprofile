var App = angular.module('App', ['ngRoute','ViewController','ui.bootstrap']);
var socket = io.connect();
var i = 0;
socket.on('message', function (data) {
    console.log(data);
});
socket.on('test', function (data) {
    console.log(data);
});
$(document).click(function(){
    socket.emit('send',{i:i++});
});
App.run(function ($rootScope,AuthService,$window,Session) {

    $rootScope.$on('$routeChangeStart', function (event, next) {
        console.log(Session.get());
        if(next.$$route.data.requireLogin && !AuthService.isAuthenticated()){
            $window.location.href = '/users/login';
        }
    });
});

App.config(['$routeProvider','$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/',{
                templateUrl:'ang/pages/index',
                controller: 'IndexController',
                data:{
                    requireLogin:false
                }
            }).
            when('/users/login', {
                templateUrl: 'ang/users/login',
                controller: 'LoginController',
                data:{
                    requireLogin:false
                }
            }).
            when('/users/signup', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController',
                data:{
                    requireLogin:true
                }
            }).
            when('/users/activate/:id', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController',
                data:{
                    requireLogin:true
                }
            }).
            when('/404-error-page-not-fucking-found',{
                templateUrl:'ang/pages/error',
                controller: 'ErrorController',
                data:{
                    requireLogin:false
                }
            }).
            otherwise({
                redirectTo: '/404-error-page-not-fucking-found'
            });

        $locationProvider.html5Mode(true);
    }
]);

App.factory('AuthService', function ($http, Session, $window,$rootScope) {
    var authService = {};

    authService.login = function (credentials) {
        return $http({
            method: 'POST',
            url: '/api/users/login',
            data: credentials,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            if(data.success){
                Session.set(data.token,function(){
                    return $window.location.href = '/'+data.token;
                });

            } else {
                $rootScope.alerts = data.msg;
            }
        });
    };

    authService.isAuthenticated = function () {
        return !!Session.get();
    };

    return authService;
});

App.factory('Session', function () {
    var Session = {};
    Session.set = function(token,callback){
        localStorage.setItem('token',token);
        if(typeof callback == 'function'){
            return callback();
        }
    };
    Session.get = function(){
        return localStorage.getItem('token');
    }
    Session.destroy = function(){
        localStorage.removeItem("token");
    }
    return Session;
})

App.controller('AppController', function ($scope, $http, $rootScope) {
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});