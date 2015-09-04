//Index Controller
angular.module('App').controller('IndexController', function ($scope, $http, $rootScope, $routeParams, $location,Facebook) {
  $rootScope.head = {
    title: 'Skater Profile! skateboarding digital community',
    metas: [
      {
        name: 'keywords',
        content: 'Skateboarding, skater profile'
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



