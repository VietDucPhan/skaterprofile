//Main Menu Directive
angular.module('App').directive('commentBox', function ($location, Session, $http, $rootScope, Socket) {
  var CommentBox = {};
  CommentBox.restrict = 'A';
  CommentBox.template = '<input ng-model="message" type="text" placeholder="Add a comment" class="form-control"><span class="input-group-btn"><button ng-click="post()" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-comment"></span></button></span>'
  CommentBox.link = function (scope, ele, att) {
    if($rootScope.alias && $rootScope.alias.picture && $rootScope.alias.picture.source){
      scope.profile_image = $rootScope.alias.picture.source
    }

    scope.post = function(){
      console.log(scope.message);
    }
  }
  return CommentBox;
});


