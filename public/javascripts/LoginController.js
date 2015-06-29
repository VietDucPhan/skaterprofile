var AppController = angular.module('AppController', []);

AppController.controller('LoginController', ['$scope', '$http',
    function ($scope, $http) {

        $scope.loginSubmit = function (data) {
            $http({
                method: 'POST',
                url: '/api/users/login',
                data: data,  // pass in data as strings
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            })
                .success(function (data) {
                    console.log(data);
                });
        }
    }
]);