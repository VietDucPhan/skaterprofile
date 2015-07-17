//Index Controller
angular.module('App').controller('IndexController', function ($scope, $http, $rootScope, $routeParams, $location) {
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
    if ($routeParams.id) {
        $http.post('/api/users/activate', {code: $routeParams.id}).
            success(function (data) {
                if (data.error) {
                    $rootScope.alerts = data.error.message;

                } else {
                    $rootScope.alerts = data.message;
                    $location.url('/');
                }

            });
    }
    $scope.text = 'page';
});



