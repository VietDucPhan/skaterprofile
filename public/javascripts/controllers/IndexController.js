//Index Controller
angular.module('App').controller('IndexController', function ($scope, $http, $rootScope) {
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



