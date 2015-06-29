var App = angular.module('App', ['ngRoute','AppController']);
App.config(['$routeProvider','$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/',{
                templateUrl:'ang/pages/index',
                controller: 'IndexController'
            }).
            when('/users/login', {
                templateUrl: 'ang/users/login',
                controller: 'LoginController'
            }).
            when('/users/signup', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController'
            }).
            when('/404-error-page-not-fucking-found',{
                templateUrl:'ang/pages/error',
                controller: 'ErrorController'
            }).
            otherwise({
                redirectTo: '/404-error-page-not-fucking-found'
            });
        $locationProvider.html5Mode(true);
    }
]);
