var App = angular.module('App', ['ngRoute','ui.bootstrap']);
var i = 0;
App.run(function ($rootScope,Auth,$window,Session,$http,$interval) {
    //Session.destroy();
    $http.defaults.headers.common.token = Session.get();

    $rootScope.$on('$routeChangeStart', function (event, next) {
        console.log(Session.get());
        Session.refresh();
        if(next.$$route.data.requireLogin){
            if(!Auth.isAuthenticated()){
                $window.location.href = '/users/login';
            }
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
                    requireLogin:false
                }
            }).
            when('/users/activate/:id', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController',
                data:{
                    requireLogin:false
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



App.controller('AppController', function ($scope, $http, $rootScope, Auth) {
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.notifications = function(){
        return null
    };

    $scope.logout =  function(){
        return Auth.logout();
    }
});