var App = angular.module('App', ['ngRoute', 'ui.bootstrap', 'angular-loading-bar', 'angularFileUpload','ngSanitize'],function($compileProvider){
  $compileProvider.directive('compile', function($compile) {
    // directive factory creates a link function
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  });
}).config(['$routeProvider', '$locationProvider', 'cfpLoadingBarProvider',
  function ($routeProvider, $locationProvider, cfpLoadingBarProvider) {
    cfpLoadingBarProvider.loadingBarTemplate = '<div id="loading-bar" class="progress page-loading"> <div class="bar progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"> </div> </div>';
    cfpLoadingBarProvider.includeSpinner = false;
    $routeProvider.
      when('/', {
        redirectTo:'/dashboard'
      }).
      when('/dashboard', {
        templateUrl: 'ang/pages/dashboard',
        controller: 'DashboardController',
        data: {
          requireLogin: false
        }
      }).
      when('/hot', {
        templateUrl: 'ang/pages/hot',
        controller: 'DashboardController',
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
        templateUrl: 'ang/users/setting',
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
      when('/users/create-profile', {
        templateUrl: 'ang/users/create-profile',
        controller: 'CreateProfileController',
        data: {
          requireLogin: false
        }
      }).
      when('/profile/:account/edit', {
        templateUrl: 'ang/users/edit-profile',
        controller: 'EditProfileController',
        data: {
          requireLogin: true
        }
      }).
      when('/post/:id', {
        templateUrl: 'ang/pages/post-detail',
        controller: 'PostdetailController',
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
]).run(function ($rootScope, Auth, $window, Session, $http, $interval, cfpLoadingBar, $location,$route) {
  $rootScope.$on('session_refresh',function(e){
    Session._getNewToken();
  })
  var original = $location.path;
  $location.path = function (path, reload) {
    if (reload === false) {
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
        $route.current = lastRoute;
        un();
      });
    }
    return original.apply($location, [path]);
  };
  //Session.destroy();
  $http.defaults.headers.common.token = Session.get();
  $rootScope.$on('$routeChangeStart', function (event, next) {
    Session.refresh();
    if (next.$$route && next.$$route.data && next.$$route.data.requireLogin) {
      if (!Auth.isAuthenticated()) {
        $window.location.href = '/';
        $rootScope.alerts = [{msg:'You are not authorized',type:"warning"}];
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
    title: 'Skater Profile! skateboarding digital community',
    metas: [
      {
        name: 'keywords',
        content: 'Skateboarding, skater profile'
      },
      {
        name: 'description',
        content: 'World largest skateboarding digital community'
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
}).controller('DashboardController', function ($scope, $http, $rootScope, $routeParams, $location,Facebook) {
  $rootScope.head = {
    title: 'Skater Profile',
    metas: [
      {
        name: 'keywords',
        content: 'Skateboarding, skater, blog, profile, post'
      },
      {
        name: 'description',
        content: 'Find and follow your favourite skater.  Create your own profile today!!!'
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
}).controller('SettingController', function ($scope, $http, $location, $rootScope, FileUploader, Session, $routeParams) {
  $scope.profile = {
    sex: 1
  };
  (function () {
    $http.get('/api/users/profile').success(function (data) {
      if (data.error) {
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
    if (response && response.error) {
      $rootScope.alerts = response.error.message;
    } else {
      $rootScope.alerts = response.response.message
      Session.set(response, function () {

      })
    }
  };

  $scope.profileSubmit = function (profile) {
    $http.post('/api/users/create/your-profile', profile).success(function (data) {
      if (data.error) {
        $rootScope.alerts = data.error.message;
      } else {
        $rootScope.alerts = data.message;
        $scope.profile = data.response;
        $rootScope.alias = data.response;
      }
    })
  }

  $scope.settingInclude = function(){
    return '/ang/users/'+$routeParams.page;
  }
  $scope.new_password = {};
  $scope.changePassword = function(data){
    $scope.new_password = {};
    if(data.new_pass.length < 6 || data.new_pass.length > 24){
      $rootScope.alerts = [{msg:'Passwords must greater than 6 and less than 24 characters',type:'warning'}];
    } else if(data.new_pass !== data.new_pass2){
      $rootScope.alerts = [{msg:'Passwords not matched',type:'warning'}];
    } else {
      $http.post('/api/users/change-password',data).success(function(res){

        if(res && res.error){
          $rootScope.alerts = res.error.message;
        } else {
          $rootScope.alerts = res.message;
        }
      }).error(function(){
        $rootScope.alerts = [{msg:'An unexpected error happened, please try again latter',type:'danger'}];
      });
    }
  }
}).controller('ProfileController', function ($scope, $http, $routeParams,$rootScope,$sce){
  $scope.editable = false;

  $scope.aliasPage = null;
  function chunk(arr, size) {
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    return newArr;
  }

  $scope.youtube = function(id){
    return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+id+"?rel=0&amp;controls=0&amp;showinfo=0")
  }

  $scope.vimeo = function(id){
    return $sce.trustAsResourceUrl("https://player.vimeo.com/video/"+id)
  }

  $http.get('/api/alias/'+$routeParams.user).success(function(response){
    if(response && !response.error){
      $scope.aliasPage = response.response;
      $scope.aliasPage.chuckedPosts = [];
      if($scope.aliasPage && $scope.aliasPage.posts){
        $scope.aliasPage.chuckedPosts = chunk($scope.aliasPage.posts,3);
      }

      $rootScope.head = {
        title: $scope.aliasPage.name + ' | Skater Profile',
        metas: [
          {
            name: 'keywords',
            content: 'Skateboarding, skater profile, ' + $scope.aliasPage.name
          },
          {
            name: 'description',
            content: 'Follow ' + $scope.aliasPage.name + " for more skateboarding related post"
          }
        ]
      };

      if($rootScope.user && ($rootScope.user._id ==  response.response.admin || (response.response.managers && response.response.managers.indexOf($rootScope.user._id) != -1) || (response.response.config && response.response.config.public_editing == 1))){
        $scope.editable = true;
      }

      $scope.aliasTemplate = function () {
        return '/ang/pages/'+$scope.aliasPage.type+'-alias';
      }
    } else {
      $rootScope.alerts = response.error.message;
    }
  })
}).controller('CreateProfileController',function($scope,$http,$rootScope,$window, Session){
  $scope.newProfileData = {
    type: 'skater',
    isYourProfile:0,
    sex:0,
    status:0,
    stance:0,
    config:{
      public_editing:1,
      public_posting:1
    }
  }

  $scope.createProfileTempUrl = '/ang/elements/create-profile-form/create-skater-form';
  $scope.changeSkaterType = function(type){
    $scope.newProfileData.type = type;
    $scope.createProfileTempUrl = '/ang/elements/create-profile-form/create-'+type+"-form";
  }

  $scope.newProfileSubmit = function(data){
    $http.post('/api/users/create/new-profile',data).success(function(res){
      if(res && res.error){
        $rootScope.alerts = res.error.message;
      } else if(res && res.token) {
        Session.set(res,function(){
          $window.location.href = '/profile/'+res.response.alias.username+'/edit';
        })
      } else {
        $window.location.href = '/profile/'+res.response.username+'/edit';
      }
    }).error(function(){
      $rootScope.alerts = [{msg:'Errors occured please try again latter',type:"danger"}]
    })
  }

}).controller('EditProfileController',function($scope,$http,$routeParams,$rootScope,FileUploader,$window, Session){
  $scope.editProfileTemplate = '/ang/users/edit-skater'

  $http.get('/api/alias/'+$routeParams.account).success(function(response){
    if(response && response.error){
      $rootScope.alerts = response.error.message
    } else {
      var uploader = $scope.uploader = new FileUploader({
        url: '/api/alias/change-picture',
        autoUpload: true,
        removeAfterUpload: true
      });

      uploader.onBeforeUploadItem = function (item) {
        item.headers.token = Session.get();
        item.headers.alias_id = response.response._id;
        //console.info('onBeforeUploadItem', item);
      };
      uploader.onSuccessItem = function (fileItem, response, status, headers) {
        if (response && response.error) {
          $rootScope.alerts = response.error.message;
        } else {
          if(response.response && response.response.alias){
            $rootScope.alerts = response.response.message;
            $scope.editProfile.picture = response.response.alias.picture
          }
          if($rootScope.user && $scope.editProfile.admin == $rootScope.user._id){
            Session.set(response, function () {

            })
          }
        }
      };


      if($rootScope.user && ((response.response.managers && response.response.managers.indexOf($rootScope.user._id) != -1) || (response.response.config && response.response.config.public_editing == 1))){
        $scope.edit_skater = '/ang/elements/edit-skater-form/basic-info';
        $scope.type = 'basic-info';
        $scope.editProfile = response.response;
        var username = response.response.username
        $scope.isOwner = false;
        if($rootScope.user._id == response.response.admin || response.response.managers.indexOf($rootScope.user._id) != -1){
          $scope.isOwner = true;
        }



        $scope.change = function(template){
          $scope.type = template;
          $scope.edit_skater = '/ang/elements/edit-skater-form/' + template;
        }

        $scope.editProfileSubmit = function (profile) {
          $http.post('/api/alias/edit-profile', profile).success(function (data) {
            if (data && data.error) {
              $rootScope.alerts = data.error.message;
            } else {
              $rootScope.alerts = data.message;
              if(username !== data.response.username){
                $window.location.href = '/profile/'+data.response.username+'/edit';
              }

            }
          })
        }
      } else {
        $window.location.href = '/'
      }
    }

  })
}).controller('PostdetailController',function($scope,$http,$routeParams,$rootScope,$sce,$modal, $location){
  $scope.post_detail_url = '/ang/elements/post-detail/image';
  $scope.video_src = ''
  $rootScope.$on('refresh_showposts', function (status,data) {
    if($routeParams.id == data.deleted_post){
      $rootScope.alerts = data.message;
      if($rootScope.user && $rootScope.user.alias && $rootScope.user.alias.username){
        $location.path('/' + $rootScope.user.alias.username,true);
      } else {
        $location.path('/',true);$location.path('/',true);
      }

    }

  })
  $http.get('/api/posts/get/detail/'+$routeParams.id).success(function(data){
    if(data && !data.error){
      $scope.postData =  data;
      $scope.owned_post = data.posted_by_alias == data.posted_to_alias;
      $scope.isDeletable = false;
      $rootScope.head = {
        title: 'Post detail | Skater Profile',
        metas: [
          {
            name: 'keywords',
            content: 'Skateboarding, skater profile,'
          },
          {
            name: 'description',
            content: data.name
          }
        ]
      };
      if($rootScope.user && (($rootScope.user.alias && ($rootScope.user.alias._id == data.posted_to_alias)) || ($rootScope.user._id == data.posted_by_user))){
        $scope.isDeletable = true;
      }
      if($scope.postData && $scope.postData.type != 'facebook' ){
        $scope.post_detail_url = '/ang/elements/post-detail/video';
      }

      switch ($scope.postData.type){
        case 'youtube' :
          $scope.video_src = $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+$scope.postData.video_id+"?rel=0&amp;showinfo=0")
          break;
        case 'vimeo' :
          $scope.video_src = $sce.trustAsResourceUrl("https://player.vimeo.com/video/"+$scope.postData.video_id)
          break
      }

      $scope.delete = function (id) {
        $modal.open({
          animation: false,
          template: '<div class="modal-header"><h3 class="modal-title">Delete Post</h3></div><div class="modal-body"><p>{{content}}</p></div><div ng-if="flag" class="modal-footer"> <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button> <button class="btn btn-primary" type="button" ng-click="confirm()">Confirm</button> </div>',
          controller: deleteModalController,
          resolve: {
            id: function () {
              return id;
            }
          }
        });
      }

    } else {
      $rootScope.alerts = data.error.message;
    }

  })
})