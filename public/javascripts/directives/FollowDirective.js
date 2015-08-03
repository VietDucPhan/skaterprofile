//Main Menu Directive
angular.module('App').directive('followButton', function ($location,Session,$http, $rootScope) {
  var followButton = {};
  followButton.restrict = 'E';
  followButton.scope = {
    aliasId:'&aliasId'
  };


  followButton.template = '<button class="btn btn-{{followButtonName}}" ng-click="follow()">{{followButtonName}}</button>'
  followButton.link = function(scope, ele){
    scope.followButtonName = 'follow'
    $http.post('/api/alias/isfollowing',{id:scope.aliasId()}).success(function(response){
      if(response && response.error){
        $rootScope.alerts = response.error.message;

      } else if(response && response.response && response.response.isFollow){
        scope.followButtonName = 'unfollow'
      } else {
        scope.followButtonName = 'follow'
      }
    }).error(function(){
      scope.followButtonName = 'error'
    })

    scope.follow = function(){
      $http.post('/api/alias/follow/',{id:scope.aliasId()}).success(function(res){
        if(res && res.error){
          $rootScope.alerts = res.error.message;

        } else {
          scope.followButtonName = 'unfollow'
        }
      }).error(function(){
        scope.followButtonName = 'error'
      })
    }

    scope.
  }
  return followButton;
});


