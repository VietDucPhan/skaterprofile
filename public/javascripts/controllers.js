var AppController = angular.module('AppController', []);

AppController.controller('IndexController', ['$scope', '$http',
    function ($scope, $http) {
    }
]);
AppController.controller('LoginController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.loginSubmit = function(data){
            return console.log(data);
        }
    }
]);