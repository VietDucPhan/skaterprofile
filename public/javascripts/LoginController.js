//Login Controller
AppController.controller('LoginController', function ($scope, $http, $rootScope,$window) {
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
            if(data.success){
                $window.location.href = '/';
            } else {
                $rootScope.alerts = data.msg;
            }
        });
    }
});