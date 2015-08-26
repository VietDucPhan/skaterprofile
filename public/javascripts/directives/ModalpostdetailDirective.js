/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('postDetail', function ($http, $rootScope, $modal, $location) {
  var postDetail = {};
  postDetail.restrict = 'A';
  postDetail.scope = {
    backState :'@backState'
  }
  postDetail.link = function (scope, elem, att) {
    var post_id = att.postDetail;
    var back_state = scope.backState || '/';
    elem.on('click', function (e) {
      if (post_id &&  e.which === 1) {

        $location.path('/post/' + post_id, false);

        $modal.open({
          animation: false,
          templateUrl: '/ang/pages/post-detail',
          controller: ModalPostDetailController,
          windowClass:'post-detail-modal',
          resolve:{
            post_id:function () {
              return post_id;
            },
            back_state:function(){
              return back_state;
            }
          }
        });

      }
    })
  }

  return postDetail;
});

var ModalPostDetailController = function (post_id,back_state,$scope,$http, $sce,$modalInstance,$location) {
  $scope.show_cancel = true;
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.video_src = ''
  $modalInstance.result.then(function (selectedItem) {
    //$log.info('selectedItem',selectedItem);
  }, function () {
    $location.path(back_state, false);
  });
  $http.get('/api/posts/get/detail/' + post_id).success(function (data) {
    if (data && !data.error) {
      $scope.postData = data;
      if ($scope.postData && $scope.postData.type != 'facebook') {
        $scope.post_detail_url = '/ang/elements/post-detail/video';
      } else {
        $scope.post_detail_url = '/ang/elements/post-detail/image';
      }

      switch ($scope.postData.type) {
        case 'youtube' :
          $scope.video_src = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.postData.video_id + "?rel=0&amp;controls=0&amp;showinfo=0")
          break;
        case 'vimeo' :
          $scope.video_src = $sce.trustAsResourceUrl("https://player.vimeo.com/youtube.jade/" + $scope.postData.video_id)
          break
      }

    } else {
      $rootScope.alerts = data.error.message;
    }

  })

}