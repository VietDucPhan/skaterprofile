var App = angular.module('App', ['ngRoute', 'ui.bootstrap', 'angular-loading-bar']).config(['$routeProvider', '$locationProvider', 'cfpLoadingBarProvider',
    function ($routeProvider, $locationProvider, cfpLoadingBarProvider) {
        console.log();
        cfpLoadingBarProvider.loadingBarTemplate = '<div id="loading-bar" class="progress page-loading"> <div class="bar progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"> </div> </div>';
        cfpLoadingBarProvider.includeSpinner = false;
        $routeProvider.
            when('/', {
                templateUrl: 'ang/pages/index',
                controller: 'IndexController',
                data: {
                    requireLogin: false
                }
            }).
            when('/users/login', {
                templateUrl: 'ang/users/login',
                controller: 'LoginController',
                data: {
                    requireLogin: false
                }
            }).
            when('/users/signup', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController',
                data: {
                    requireLogin: false
                }
            }).
            when('/users/activate/:id', {
                templateUrl: 'ang/users/signup',
                controller: 'SignupController',
                data: {
                    requireLogin: false
                }
            }).
            when('/404-error-page-not-fucking-found', {
                templateUrl: 'ang/pages/error',
                controller: 'ErrorController',
                data: {
                    requireLogin: false
                }
            }).
            otherwise({
                redirectTo: '/404-error-page-not-fucking-found',
                data: {
                    requireLogin: false
                }
            });

        $locationProvider.html5Mode(true);
    }
]).run(function ($rootScope, Auth, $window, Session, $http, $interval) {

    //Session.destroy();
    $http.defaults.headers.common.token = Session.get();
    $rootScope.$on('$routeChangeStart', function (event, next) {
        Session.refresh();

        if (next.$$route && next.$$route.data && next.$$route.data.requireLogin) {
            if (!Auth.isAuthenticated()) {
                $window.location.href = '/users/login';
            }
        }
    });
}).controller('AppController', function ($scope, $http, $rootScope, Auth) {
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.notifications = null;
    $scope.logout = function () {
        return Auth.logout();
    }
});