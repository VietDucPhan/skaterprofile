//Login Controller
angular.module('App').controller('ErrorController', function ($scope, $http, $rootScope,$window , Auth) {
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