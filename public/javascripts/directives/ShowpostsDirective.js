/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('showPosts', function ($http, $rootScope, $sce) {
  var showPosts = {};
  showPosts.restrict = 'A';
  showPosts.scope = {
    aliasId: '&aliasId',
    hot: '&hot',
    following: '&following',
    postPerRow: '&postPerRow',
    backState: '@backState'
  };

  showPosts.templateUrl = function (ele, att) {
    return '/ang/pages/showposts';
  }
  showPosts.link = function (scope) {
    var link = '/api/posts/get';
    scope.back_state = scope.backState || '/';
    var data = {
      aliasId: scope.aliasId() || null,
      hot: scope.hot() || false,
      following: scope.following() || false
    }
    scope.postClass = scope.postPerRow() || 12;



    scope.youtube = function (id) {
      return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + id + "?rel=0&amp;showinfo=0")
    }

    scope.vimeo = function (id) {
      return $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + id)
    }

    var getPost = function () {
      $http.post(link, data).success(function (res) {
        if (res && res.error) {
          $rootScope.alerts = res.error.message;
        } else {
          scope.posts = res.response;

          //console.log(res.response);
        }
      })
    }

    getPost();

    $rootScope.$on('refresh_showposts', function (data) {
      //console.log(data);
      getPost()
    })
  }

  return showPosts;
});