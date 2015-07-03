//Login Controller
AppController.controller('LoginController', function ($scope, $http, $rootScope,$window , AuthService) {
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
        AuthService.login(data);
    }
});