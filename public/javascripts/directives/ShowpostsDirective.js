/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('showPosts', function ($http, $rootScope, $sce, $modal, $window, $timeout) {
  var showPosts = {};
  showPosts.restrict = 'A';
  showPosts.scope = {
    aliasId: '&aliasId',
    hot: '&hot',
    following: '&following',
    postPerRow: '&postPerRow',
    backState: '@backState',
    changePage: '@changePage'
  };

  showPosts.templateUrl = function (ele, att) {
    if (att.sideShowPosts == 'true') {
      return '/ang/pages/side_showposts';
    } else {
      return '/ang/pages/showposts';
    }

  }
  showPosts.link = function (scope) {
    var link = '/api/posts/get';
    var id = null;
    scope.back_state = scope.backState || '/';
    scope.change_page = scope.changePage || false;
    var data = {
      aliasId: scope.aliasId() || null,
      hot: scope.hot() || false,
      following: scope.following() || false
    }
    scope.postClass = scope.postPerRow() || 12;

    scope.report_modal = function (id) {
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
          scope.remain_posts_length = res.response_length;
          //console.log(res.response);
        }
      })
    }

    getPost();

    var flag = true;
    scope.load_post_text = 'Show post'
    scope.show_more = function () {
      if (flag) {
        scope.load_post_text = 'Loading...'
        flag = false
        var posts_length = scope.posts.length;
        if (scope.posts && posts_length > 0) {
          data._id = scope.posts[posts_length - 1]._id;
        }
        $http.post(link, data).success(function (res) {
          flag = true;
          scope.load_post_text = 'Show post'
          if (res && res.error) {
            $rootScope.alerts = res.error.message;
          } else {
            scope.posts = scope.posts.concat(res.response);
            scope.remain_posts_length = res.response_length;
          }
        })
      }

    }

    angular.element($window).bind("scroll", function () {
      var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
      var body = document.body, html = document.documentElement;
      var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      windowBottom = windowHeight + window.pageYOffset;
      if (windowBottom >= docHeight) {
        scope.show_more();
      }
    });

    $rootScope.$on('refresh_showposts', function (data) {
      //console.log(data);
      getPost()
    })
  }

  return showPosts;
});