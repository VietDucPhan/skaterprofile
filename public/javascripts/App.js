var App = angular.module('App', ['ngRoute','ViewController','ui.bootstrap']);
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
            when('/users/activate/:id', {
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
App.controller('AppController', function ($scope, $http, $rootScope) {
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});