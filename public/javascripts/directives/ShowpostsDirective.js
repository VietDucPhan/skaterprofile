/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('showPosts', function ($http) {
  var showPosts = {};
  showPosts.restrict = 'A';
  showPosts.scope = {
    aliasId:'&aliasId',
    hot:'&hot',
    following:'&following',
    postPerRow:'&postPerRow'
  };

  showPosts.templateUrl = function(ele,att){
    return '/ang/pages/showposts' ;
  }
  showPosts.link = function(scope){
    var link = '/api/posts/get';
    var data = {
      aliasId: scope.aliasId() || null,
      hot: scope.hot() || false,
      following: scope.following() || false
    }
    scope.postClass = scope.postPerRow() || 12;
    console.log(data);
    $http.post(link,data).success(function(res){
      console.log(res);
    })
  }

  return showPosts;
});