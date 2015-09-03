//Main Menu Directive
angular.module('App').directive('followButton', function ($location, Session, $http, $rootScope, $window, $location) {
  var followButton = {};
  followButton.restrict = 'A';
  followButton.template = '<button ng-if="showPicture" class="profile-picture "><img ng-src="{{picture}}"></button>' +
    '<a ng-if="showName || username" href="/{{username}}" ng-click="dismiss()" class="btn username {{showNameClass}}">{{username}}</a> ' +
    '<button ng-if="showFollowButton" class="btn follow-btn btn-{{followButtonName}} {{followButtonHide}}" ng-click="follow()">{{followButtonName}}</button>'
  followButton.scope = {
    showName: '@showName',
    showFollowButton: '@showFollowButton',
    showPicture:'@showPicture'
  }
  followButton.link = function (scope, ele, att) {
    scope.followButtonName = 'follow';
    scope.followButtonHide = '';
    scope.username = null;
    if ($rootScope.alias && att.aliasId === $rootScope.alias._id || scope.showFollowButton == 'false') {
      scope.followButtonHide = 'ng-hide'
    }

    scope.showFollowButton = scope.showFollowButton == 'true' ? true : false;
    scope.showPicture = scope.showPicture == 'true' ? true : false;

    if (scope.showName == 'true') {
      scope.showName = true
      $http.get('/api/alias/' + att.aliasId).success(function (response) {
        if (response && response.response && response.response.username) {
          scope.username = response.response.username
          if(response.response.picture){
            scope.picture  = response.response.picture.picture
          }
        }
      })
    } else {
      scope.showName = false;
      scope.showNameClass = 'ng-hide';
    }
    $http.post('/api/alias/isfollowing', {id: att.aliasId}).success(function (response) {
      if (response && response.error) {
        $rootScope.alerts = response.error.message;

      } else if (!response) {
        scope.followButtonName = 'follow'
      } else {
        scope.followButtonName = 'following'
      }
    }).error(function () {
      scope.followButtonName = 'error'
    })

    scope.follow = function () {
      $http.post('/api/alias/follow/', {id: att.aliasId}).success(function (res) {
        if (res && res.error) {
          $rootScope.alerts = res.error.message;
          scope.followButtonName = 'error'
        } else if (res && res.status == 'following') {
          scope.followButtonName = 'following'
          $rootScope.$broadcast('session_refresh',true);
        } else {
          scope.followButtonName = 'follow'
          $rootScope.$broadcast('session_refresh',true);
        }
      }).error(function () {
        scope.followButtonName = 'error'
      })
    }
  }
  return followButton;
});


