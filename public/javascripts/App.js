var App = angular.module('App', ['ngRoute', 'ui.bootstrap', 'angular-loading-bar', 'angularFileUpload']).config(['$routeProvider', '$locationProvider', 'cfpLoadingBarProvider',
  function ($routeProvider, $locationProvider, cfpLoadingBarProvider) {
    cfpLoadingBarProvider.loadingBarTemplate = '<div id="loading-bar" class="progress page-loading"> <div class="bar progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"> </div> </div>';
    cfpLoadingBarProvider.includeSpinner = false;
    $routeProvider.
      when('/', {
        templateUrl: 'ang/pages/index',
        controller: 'IndexController',
        data: {
          requireLogin: false
        }
      }).
      when('/users/login', {
        templateUrl: 'ang/users/login',
        controller: 'LoginController',
        data: {
          requireLogin: false
        }
      }).
      when('/users/setting/:page', {
        templateUrl: function (currentRoute) {
          return 'ang/users/' + currentRoute.page
        },
        controller: 'SettingController',
        data: {
          requireLogin: true
        }
      }).
      when('/users/signup', {
        templateUrl: 'ang/users/signup',
        controller: 'SignupController',
        data: {
          requireLogin: false
        }
      }).
      when('/users/activate/:id', {
        templateUrl: 'ang/pages/index',
        controller: 'IndexController',
        data: {
          requireLogin: false
        }
      }).
      when('/:user', {
        templateUrl: 'ang/pages/alias',
        controller: 'ProfileController',
        data: {
          requireLogin: false
        }
      }).
      when('/404-error-page-not-fucking-found', {
        templateUrl: 'ang/pages/error',
        controller: 'ErrorController',
        data: {
          requireLogin: false
        }
      }).
      otherwise({
        redirectTo: '/404-error-page-not-fucking-found',
        data: {
          requireLogin: false
        }
      });
    $locationProvider.html5Mode(true);
  }
]).run(function ($rootScope, Auth, $window, Session, $http, $interval, cfpLoadingBar, $location) {

  //Session.destroy();
  $http.defaults.headers.common.token = Session.get();
  $rootScope.$on('$routeChangeStart', function (event, next) {
    Session.refresh();
    if (next.$$route && next.$$route.data && next.$$route.data.requireLogin) {
      if (!Auth.isAuthenticated()) {
        $window.location.href = '/users/login';
      }
    }
  });
}).directive('validFile',function(){
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){
      //change event is fired when file is selected
      el.bind('change',function(){
        scope.$apply(function(){
          ngModel.$setViewValue(el.val());
          ngModel.$render();
        });
      });
    }
  }
}).controller('AppController', function ($scope, $http, $rootScope, Auth, Facebook) {
  $rootScope.head = {
    title: 'SkaterProfile',
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
  $scope.testFacebookApi = function () {
    //console.log('abc')
    Facebook.post();
  }
  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.notifications = null;
  $scope.logout = function () {
    return Auth.logout();
  }
}).controller('SettingController', function ($scope, $http, $location, $rootScope, FileUploader, Session) {
  $scope.profile = {
    sex: 1
  };
  (function () {
    $http.get('/api/users/profile').success(function (data) {
      if (data.error) {
        $scope.profile = {}
        $rootScope.alerts = data.error.message;
      } else {
        $scope.profile = data.response
      }
    })
  })();
  $scope.suggestUsername = function () {
    return $scope.profile.name
  }


  var uploader = $scope.uploader = new FileUploader({
    url: '/api/users/upload-picture',
    autoUpload: true,
    removeAfterUpload: true
  });

  uploader.onBeforeUploadItem = function (item) {
    item.headers.token = Session.get();
    //console.info('onBeforeUploadItem', item);
  };
  uploader.onSuccessItem = function (fileItem, response, status, headers) {
    console.log(response);
    if (response && response.error) {
      $rootScope.alerts = response.error.message;
    } else {
      $rootScope.alerts = response.response.message
      Session.set(response, function () {

      })
    }
  };

  $scope.profileSubmit = function (profile) {
    $http.post('/api/users/create/profile', profile).success(function (data) {
      if (data.error) {
        $rootScope.alerts = data.error.message;
      } else {
        $rootScope.alerts = data.message;
        $scope.profile = data.response;
        $rootScope.user.profile = data.response;
      }
    })
  }
}).controller('ProfileController', function ($scope, $http, $routeParams,$rootScope){

  $scope.aliasPage = null;
  function chunk(arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    return newArr;
  }

  $http.get('/api/alias/'+$routeParams.user).success(function(response){
    console.log(response);
    if(response && !response.error){
      $scope.aliasPage = response.response;
      $scope.aliasPage.chuckedPosts = chunk($scope.aliasPage.posts,3);
      $scope.aliasTemplate = function () {
        return '/ang/pages/'+$scope.aliasPage.type+'-alias';
      }
    } else {
      $rootScope.alerts = response.error.message;
    }
  })
})