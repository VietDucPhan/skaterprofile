//Main Menu Directive
angular.module('App').directive('followButton', function ($location, Session, $http, $rootScope, $window, $location) {
  var followButton = {};
  followButton.restrict = 'A';
  followButton.template = '<button ng-if="username" ng-click="toAliasPage()" class="follow-username btn follow-btn {{followButtonHide}}">{{username}}</button> <button class="btn follow-btn btn-{{followButtonName}} {{followButtonHide}}" ng-click="follow()">{{followButtonName}}</button>'
  followButton.scope = {
    showName: '@showName'
  }
  followButton.link = function (scope, ele, att) {
    scope.followButtonName = 'follow';
    scope.followButtonHide = '';
    if ($rootScope.alias && att.aliasId === $rootScope.alias._id) {
      scope.followButtonHide = 'ng-hide'
    }
    console.log(scope.showName);
    if (scope.showName == 'true') {
      $http.get('/api/alias/' + att.aliasId).success(function (response) {
        if (response && response.response && response.response.username) {
          scope.username = response.response.username
          scope.toAliasPage = function () {
            $location.path('/' + scope.username, true);
          }
        }
      })
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


