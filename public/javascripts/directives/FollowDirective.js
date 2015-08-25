//Main Menu Directive
angular.module('App').directive('followButton', function ($location,Session,$http, $rootScope) {
  var followButton = {};
  followButton.restrict = 'A';
  followButton.template = '<button class="btn follow-btn btn-{{followButtonName}} {{followButtonHide}}" ng-click="follow()">{{followButtonName}}</button>'
  followButton.link = function(scope, ele, att){
    scope.followButtonName = 'follow';
    scope.followButtonHide = '';
    if($rootScope.alias && att.aliasId === $rootScope.alias._id){
      scope.followButtonHide = 'ng-hide'
    }
    $http.post('/api/alias/isfollowing',{id:att.aliasId}).success(function(response){
      //console.log(response);
      if(response && response.error){
        $rootScope.alerts = response.error.message;

      } else if(!response){
        scope.followButtonName = 'follow'
      } else {
        scope.followButtonName = 'following'
      }
    }).error(function(){
      scope.followButtonName = 'error'
    })

    scope.follow = function(){
      $http.post('/api/alias/follow/',{id:att.aliasId}).success(function(res){
        if(res && res.error){
          $rootScope.alerts = res.error.message;
          scope.followButtonName = 'error'
        } else if(res && res.status == 'following') {
          scope.followButtonName = 'following'
        } else {
          scope.followButtonName = 'follow'
        }
      }).error(function(){
        scope.followButtonName = 'error'
      })
    }
  }
  return followButton;
});


