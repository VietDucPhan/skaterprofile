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
                $location.path('/users/login');
            }
        });
    }
});