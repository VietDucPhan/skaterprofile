var AppController = angular.module('AppController',[]);

//Index Controller
AppController.controller('IndexController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.metas = [
            {
                name:'keywords',
                content:'abc'
            },
            {
                name:'keywords',
                content:'abc'
            }
        ];
        $scope.text = 'page';
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