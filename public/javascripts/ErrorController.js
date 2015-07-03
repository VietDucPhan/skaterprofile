//Login Controller
AppController.controller('ErrorController', function ($scope, $http, $rootScope,$window , AuthService) {
    $rootScope.head = {
        title: 'Error',
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
});