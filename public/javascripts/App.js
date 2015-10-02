var App = angular.module('App', ['ngRoute', 'ui.bootstrap', 'angular-loading-bar', 'angularFileUpload', 'ngSanitize'], function ($compileProvider) {
  $compileProvider.directive('compile', function ($compile) {
    // directive factory creates a link function
    return function (scope, element, attrs) {
      scope.$watch(
        function (scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function (value) {
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
        redirectTo: '/dashboard'
      }).
      when('/dashboard', {
        templateUrl: 'ang/pages/dashboard',
        controller: 'DashboardController',
        data: {
          requireLogin: false
        }
      }).
      when('/fresh', {
        templateUrl: 'ang/pages/hot',
        controller: 'DashboardController',
        data: {
          requireLogin: false
        }
      }).
      when('/skaters', {
        templateUrl: 'ang/pages/skaters',
        controller: 'SkatersController',
        data: {
          requireLogin: false
        }
      }).
      when('/companies', {
        templateUrl: 'ang/pages/companies',
        controller: 'CompaniesController',
        data: {
          requireLogin: false
        }
      }).
      when('/tricks', {
        templateUrl: 'ang/pages/tricks',
        controller: 'TricksController',
        data: {
          requireLogin: false
        }
      }).
      when('/spots', {
        templateUrl: 'ang/pages/spots',
        controller: 'SpotsController',
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
      when('/users/email-reset-password/:id', {
        templateUrl: 'ang/users/email-reset-password',
        controller: 'ResetpasswordController',
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
]).run(function ($rootScope, Auth, $window, Session, $http, $interval, cfpLoadingBar, $location, $route, $modal) {
  $rootScope.$on('session_refresh', function (e) {
    Session._getNewToken();
  })
  var original = $location.path;
  $rootScope.report_modal = function (id) {
    $modal.open({
      animation: false,
      templateUrl: '/ang/users/report_post',
      controller: reportModalController,
      resolve: {
        id: function () {
          return id;
        }
      }
    });
  }
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
        $rootScope.alerts = [{msg: 'You are not authorized', type: "warning"}];
      }
    }
  });
}).directive('validFile', function () {
  return {
    require: 'ngModel',
    link: function (scope, el, attrs, ngModel) {
      //change event is fired when file is selected
      el.bind('change', function () {
        scope.$apply(function () {
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

  $scope.logout = function () {
    return Auth.logout();
  }



}).controller('DashboardController', function ($scope, $http, $rootScope, $routeParams, $location, Facebook) {
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

    $http.post('/api/alias/get-manage-profiles').success(function(response){
      if(response && !response.error){
        $scope.managed_profiles = response.response;
      } else {
        $rootScope.alerts = $rootScope.error.message;
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

  $scope.settingInclude = function () {
    return '/ang/users/' + $routeParams.page;
  }
  $scope.new_password = {};
  $scope.changePassword = function (data) {
    $scope.new_password = {};
    if (data.new_pass.length < 6 || data.new_pass.length > 24) {
      $rootScope.alerts = [{msg: 'Passwords must greater than 6 and less than 24 characters', type: 'warning'}];
    } else if (data.new_pass !== data.new_pass2) {
      $rootScope.alerts = [{msg: 'Passwords not matched', type: 'warning'}];
    } else {
      $http.post('/api/users/change-password', data).success(function (res) {

        if (res && res.error) {
          $rootScope.alerts = res.error.message;
        } else {
          $rootScope.alerts = res.message;
        }
      }).error(function () {
        $rootScope.alerts = [{msg: 'An unexpected error happened, please try again latter', type: 'danger'}];
      });
    }
  }
}).controller('ProfileController', function ($scope, $http, $routeParams, $rootScope, $sce) {
  $scope.editable = false;

  $scope.aliasPage = null;
  function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
      newArr.push(arr.slice(i, i + size));
    }
    return newArr;
  }

  $scope.youtube = function (id) {
    return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + id + "?rel=0&amp;controls=0&amp;showinfo=0")
  }

  $scope.vimeo = function (id) {
    return $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + id)
  }

  $http.get('/api/alias/' + $routeParams.user).success(function (response) {
    if (response && !response.error) {
      $scope.aliasPage = response.response;
      $scope.aliasPage.stance = $scope.aliasPage.stance == 0 ? 'Goofy' : 'Regular';

      switch ($scope.aliasPage.status) {
        case 0:
          $scope.aliasPage.status = 'Skater';
          break;
        case 1:
          $scope.aliasPage.status = 'Amature skater';
          break;
        default:
          $scope.aliasPage.status = 'Proffessional skater';
          break;
      }

      switch ($scope.aliasPage.sex) {
        case 0:
          $scope.aliasPage.sex = 'Others';
          break;
        case 1:
          $scope.aliasPage.sex = 'Male';
          break;
        default:
          $scope.aliasPage.sex = 'Female';
          break;
      }

      $scope.aliasPage.following = $scope.aliasPage.following ? $scope.aliasPage.following.length : 0;
      $scope.aliasPage.followers = $scope.aliasPage.followers ? $scope.aliasPage.followers : 0;
      $rootScope.$on('increase_follower',function(status,flag){
        if(flag){
          $scope.aliasPage.followers += 1;
        } else {
          $scope.aliasPage.followers -= 1;
        }
      })
      $scope.aliasPage.chuckedPosts = [];
      if ($scope.aliasPage && $scope.aliasPage.posts) {
        $scope.aliasPage.chuckedPosts = chunk($scope.aliasPage.posts, 3);
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

      if ($rootScope.user && ($rootScope.user._id == response.response.admin || (response.response.managers && response.response.managers.indexOf($rootScope.user._id) != -1) || (response.response.config && response.response.config.public_editing == 1))) {
        $scope.editable = true;
      }

      $scope.aliasTemplate = function () {
        return '/ang/pages/' + $scope.aliasPage.type + '-alias';
      }
    } else {
      $rootScope.alerts = response.error.message;
    }
  })
}).controller('CreateProfileController', function ($scope, $http, $rootScope, $window, Session) {
  $scope.newProfileData = {
    type: 'skater',
    isYourProfile: 0,
    sex: 0,
    status: 0,
    stance: 0,
    config: {
      public_editing: 1,
      public_posting: 1
    }
  }


  $scope.open = function (e) {
    $scope.opened = true;
  }

  $scope.createProfileTempUrl = '/ang/elements/create-profile-form/create-skater-form';
  $scope.changeSkaterType = function (type) {
    $scope.newProfileData.type = type;
    $scope.createProfileTempUrl = '/ang/elements/create-profile-form/create-' + type + "-form";
  }

  $scope.newProfileSubmit = function (data) {
    $http.post('/api/users/create/new-profile', data).success(function (res) {
      if (res && res.error) {
        $rootScope.alerts = res.error.message;
      } else if (res && res.token) {
        Session.set(res, function () {
          $window.location.href = '/profile/' + res.response.alias.username + '/edit';
        })
      } else {
        $window.location.href = '/profile/' + res.response.username + '/edit';
      }
    }).error(function () {
      $rootScope.alerts = [{msg: 'Errors occured please try again latter', type: "danger"}]
    })
  }

}).controller('EditProfileController', function ($scope, $http, $routeParams, $rootScope, FileUploader, $window, Session) {
  $scope.editProfileTemplate = '/ang/users/edit-skater';

  $http.get('/api/alias/' + $routeParams.account).success(function (response) {
    if (response && response.error) {
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
          if (response.response && response.response.alias) {
            $rootScope.alerts = response.response.message;
            $scope.editProfile.picture = response.response.alias.picture
          }
          if ($rootScope.user && $scope.editProfile.admin == $rootScope.user._id) {
            Session.set(response, function () {

            })
          }
        }
      };


      if ($rootScope.user && ((response.response.managers && response.response.managers.indexOf($rootScope.user._id) != -1) || (response.response.config && response.response.config.public_editing == 1))) {
        $scope.edit_form = '/ang/elements/edit-' + response.response.type + '-form/basic-info';
        $scope.editProfileTemplate = '/ang/users/edit-' + response.response.type;
        $scope.type = 'basic-info';
        $scope.editProfile = response.response;
        $scope.username = response.response.username
        $scope.isOwner = false;
        if ($rootScope.user._id == response.response.admin || response.response.managers.indexOf($rootScope.user._id) != -1) {
          $scope.isOwner = true;
        }


        $scope.change = function (template) {
          $scope.type = template;
          $scope.edit_form = '/ang/elements/edit-' + response.response.type + '-form/' + template;
        }

        $scope.editProfileSubmit = function (profile) {
          $http.post('/api/alias/edit-profile', profile).success(function (data) {
            if (data && data.error) {
              $rootScope.alerts = data.error.message;
            } else {
              $rootScope.alerts = data.message;
              if ($scope.username !== data.response.username) {
                $window.location.href = '/profile/' + data.response.username + '/edit';
              }

            }
          })
        }
      } else {
        $window.location.href = '/'
      }
    }

  })
}).controller('PostdetailController', function ($scope, $http, $routeParams, $rootScope, $sce, $modal, $location) {
  $scope.post_detail_url = '/ang/elements/post-detail/image';
  $scope.video_src = ''
  $rootScope.$on('refresh_showposts', function (status, data) {
    if ($routeParams.id == data.deleted_post) {
      $rootScope.alerts = data.message;
      if ($rootScope.user && $rootScope.user.alias && $rootScope.user.alias.username) {
        $location.path('/' + $rootScope.user.alias.username, true);
      } else {
        $location.path('/', true);
        $location.path('/', true);
      }

    }

  })
  $rootScope.$on('added_a_comment', function (status, data) {
    $rootScope.$apply(function () {
      if (data && $scope.postData && $scope.postData._id == data.post_id) {
        if ($scope.postData && $scope.postData.comments) {
          $scope.postData.comments.push(data)
        } else {
          $scope.postData.comments = [];
          $scope.postData.comments.push(data)
        }
      }
    })
  })
  $http.get('/api/posts/get/detail/' + $routeParams.id).success(function (data) {
    if (data && !data.error) {
      $scope.postData = data;
      $scope.owned_post = data.posted_by_alias == data.posted_to_alias;
      $scope.isDeletable = false;
      $rootScope.head = {
        title: data.name + ' | Skater Profile',
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
      if ($rootScope.user && (($rootScope.user.alias && ($rootScope.user.alias._id == data.posted_to_alias)) || ($rootScope.user._id == data.posted_by_user))) {
        $scope.isDeletable = true;
      }
      if ($scope.postData && $scope.postData.type != 'facebook') {
        $scope.post_detail_url = '/ang/elements/post-detail/video';
      }

      if($scope.postData.desc){
        $scope.postData.desc = $scope.postData.desc.replace(/(?:\r\n|\r|\n)/g, "<br />")
      }

      switch ($scope.postData.type) {
        case 'youtube' :
          $scope.video_src = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.postData.video_id + "?rel=0&amp;showinfo=0")
          break;
        case 'vimeo' :
          $scope.video_src = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + $scope.postData.video_id)
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
}).controller('SkatersController', function ($scope, $http, $rootScope) {
  $http.get('/api/alias/getAllProAm').success(function (res) {
    if(res && !res.error){
      console.log(res.response);
      $scope.skaters = res.response;
    } else {
      $rootScope.alerts = res.error.message;
    }
  })
}).controller('CompaniesController', function ($scope, $http, $rootScope) {
  $http.get('/api/alias/getAllCompanies').success(function (res) {
    if(res && !res.error){
      $scope.companies = res.response;
    } else {
      $rootScope.alerts = res.error.message;
    }
  })
}).controller('SpotsController', function ($scope, $http, $rootScope) {
  $http.get('/api/alias/getAllSpots').success(function (res) {
    if(res && !res.error){
      $scope.spots = res.response;
    } else {
      $rootScope.alerts = res.error.message;
    }
  })
}).controller('TricksController', function ($scope, $http, $rootScope) {
  $http.get('/api/alias/getAllTricks').success(function (res) {
    if(res && !res.error){
      $scope.tricks = res.response;
    } else {
      $rootScope.alerts = res.error.message;
    }
  })
}).controller('ResetpasswordController', function ($scope, $http, $rootScope, $routeParams) {
  $scope.reset_code = '5b817e42_3e85_b699_b067_9af0761f85f2';
  $scope.data = {
    code:$routeParams.id
  }
  $scope.reset = function(data){
    if (data.password.length < 6 || data.password.length > 24) {
      $rootScope.alerts = [{msg: 'Passwords must greater than 6 and less than 24 characters', type: 'warning'}];
    } else if (data.password !== data.repassword) {
      $rootScope.alerts = [{msg: 'Passwords not matched', type: 'warning'}];
    } else {
      $http.post('/api/users/email-reset-password', data).success(function (res) {
        if (res && res.error) {
          $rootScope.alerts = res.error.message;
        } else {
          $rootScope.alerts = res.message;
        }
      }).error(function () {
        $rootScope.alerts = [{msg: 'An unexpected error happened, please try again latter', type: 'danger'}];
      });
    }
  }
}).filter('timeAgo', function ($interval, $rootScope) {
  // trigger digest every 60 seconds

  $interval(function () {
  }, 60000);
  function getDateDiff(time1, time2) {
    var str1 = time1;
    var t1 = new Date(str1);
    var t2 = new Date();

    function dayTime(hours, minutes) {
      var appendix = 'pm';
      if (hours < 12) {
        appendix = 'am'
      } else {
        hours = hours - 12;
      }

      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      return hours + ":" + minutes + appendix;
    }

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    var date = monthNames[t1.getUTCMonth()] + " " + t1.getDate() + ", " + t1.getFullYear() + " at " + dayTime(t1.getHours(), t1.getMinutes());
    var date_with_day = dayName[t1.getDay()] + ", " + date;

    var diffMS = t2 - t1;
    var seconds = Math.round(diffMS / 1000);
    var minutes = Math.round(diffMS / 60000);
    var hours = Math.round(diffMS / 3600000);
    return {minutes: minutes, hours: hours, date: date, seconds: seconds, full_date: date_with_day}
  }

  function fromNowFilter(time, full_date) {

    var ago_date = getDateDiff(time)
    if (full_date) {
      return ago_date.full_date;
    }
    if (ago_date.seconds < 40) {
      return 'Just now';
    } else if (ago_date.seconds >= 40 && ago_date.seconds < 59) {
      return ago_date.seconds + ' seconds';
    } else if (ago_date.minutes == 1) {
      return ago_date.minutes + ' min'
    } else if (ago_date.minutes > 1 && ago_date.minutes < 60) {
      return ago_date.minutes + ' mins'
    } else if (ago_date.minutes >= 60 && ago_date.hours < 24) {
      return ago_date.hours + ' hrs';
    } else {
      return ago_date.date
    }
  }

  fromNowFilter.$stateful = true;
  return fromNowFilter;
});