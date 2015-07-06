//Login Controller
angular.module('App').controller('LoginController', function ($scope, $http, $rootScope,$window , Auth) {
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
        Auth.login(data);
    }
});