//Main Menu Directive
angular.module('App').directive('commentBox', function ($location, Session, $http, $rootScope, Socket) {
  var CommentBox = {};
  CommentBox.restrict = 'A';
  CommentBox.template = '<input ng-model="message" type="text" placeholder="Add a comment" class="form-control"><span class="input-group-btn"><button ng-click="post()" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-comment"></span></button></span>'
  CommentBox.link = function (scope, ele, att) {
    if ($rootScope.alias && $rootScope.alias.picture && $rootScope.alias.picture.source) {
      scope.profile_image = $rootScope.alias.picture.source
    }

    scope.post = function () {
      scope.message.trim()
      if(scope.message == ''){
        return;
      }
      var message = scope.message;
      scope.message = '';
      scope.post_id = att.commentBox;
      $http.post('/api/posts/comment', {message: message, post_id: scope.post_id}).success(function (response) {
        if (response && !response.error) {
          Socket.emit('added_a_comment', response.response, function () {
          })
        } else {
          $rootScope.alerts = response.error.message
        }
      }).error(function () {
        $rootScope.alerts = [{msg: "An unexpected error occured please try again latter", type: 'warning'}]
      })
    }
    ele.on("keydown keypress",function(e){
      if(e.which === 13){
        scope.post();
      }
    })
  }
  return CommentBox;
});


