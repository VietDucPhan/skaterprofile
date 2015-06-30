var AppController = angular.module('AppController', []);

//Index Controller
AppController.controller('IndexController', function ($scope, $http, $rootScope) {
    $rootScope.head = {
        title: 'Index',
        metas: [
            {
                name: 'keywords',
                content: 'Skateboarding, skaterprofile'
            },
            {
                name: 'description',
                content: 'Skaterprofile page research'
            }
        ]
    };

    $scope.text = 'page';
});

//Login Controller
AppController.controller('LoginController', function ($scope, $http, $rootScope) {
    $rootScope.head = {
        title: 'Login',
        metas: [
            {
                name: 'keywords',
                content: 'Skateboarding, skaterprofile'
            },
            {
                name: 'description',
                content: 'Skaterprofile page research'
            }
        ]
    };

    $scope.text = 'page';
    $scope.loginSubmit = function (data) {
        $http({
            method: 'POST',
            url: '/api/users/login',
            data: data,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not request payload)
        }).success(function (data) {
            console.log(data);
        });
    }
});

//Users Controller
AppController.controller('SignupController', function ($scope, $http, $rootScope, $location) {
    $rootScope.head = {
        title: 'Users',
        metas: [
            {
                name: 'keywords',
                content: 'Skateboarding, skaterprofile'
            },
            {
                name: 'description',
                content: 'Skaterprofile page research'
            }
        ]
    };

    $scope.text = 'Users';
    $scope.signUpSubmit = function (data) {
        $http({
            method: 'POST',
            url: '/api/users/signup',
            data: data,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not
            // request payload)
        }).success(function (data) {
            if(data.success){
                $rootScope.head = {
                    title: 'Users submitted',
                    metas: [
                        {
                            name: 'keywords',
                            content: 'Skateboarding, skaterprofile, sub'
                        },
                        {
                            name: 'description',
                            content: 'Skaterprofile page research, sub'
                        }
                    ]
                };
                //$location.path('/users/login');
            }
        });
    }
});