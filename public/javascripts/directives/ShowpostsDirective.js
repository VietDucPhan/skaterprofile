/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('showPosts', function ($http,$rootScope,$sce) {
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

    scope.youtube = function(id){
      return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+id+"?rel=0&amp;controls=0&amp;showinfo=0")
    }

    scope.vimeo = function(id){
      return $sce.trustAsResourceUrl("https://player.vimeo.com/youtube.jade/"+id)
    }

    $http.post(link,data).success(function(res){
      if(res && res.error){
        $rootScope.alerts = res.error.message;
      } else {
        scope.posts = res.response;
        //console.log(res.response);
      }
    })
  }

  return showPosts;
});