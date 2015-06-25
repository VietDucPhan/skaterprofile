var App = angular.module('App', ['ngRoute', 'IndexController']);
App.config(['$routeProvider','$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/',{
                templateUrl:'index',
                controller: 'IndexController'
            }).
            when('/users/login', {
                templateUrl: 'users/partials/login',
                controller: 'IndexController'
            }).
            when('/users/signup', {
                templateUrl: 'users/partials/signup',
                controller: 'IndexController'
            }).
            when('/error',{
                templateUrl:'error',
                controller: 'ErrorController'
            }).
            otherwise({
                redirectTo: '/error'
            });
        $locationProvider.html5Mode(true);
    }
]);

var IndexController = angular.module('IndexController', []);

IndexController.controller('IndexController', ['$scope', '$http',
    function ($scope, $http) {
    }]);
App.controller('UsersController', function ($scope) {
    $scope.phones = [
        {
            'name': 'Nexus S',
            'snippet': 'Fast just got faster with Nexus S.'
        },
        {
            'name': 'Motorola XOOM™ with Wi-Fi',
            'snippet': 'The Next, Next Generation tablet.'
        },
        {
            'name': 'MOTOROLA XOOM™',
            'snippet': 'The Next, Next Generation tablet.'
        }
    ];
});