var App = angular.module('App', ['ngRoute','ui.bootstrap']);
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
App.run(function ($rootScope,Auth,$window,Session,$http,$interval) {
    $http.defaults.headers.common.token = Session.get();
    $rootScope.$on('$routeChangeStart', function (event, next) {
        Session.refresh();
        if(next.$$route.data.requireLogin && !Auth.isAuthenticated()){
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



App.controller('AppController', function ($scope, $http, $rootScope) {
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});