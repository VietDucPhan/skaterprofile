/**
 * Created by Administrator on 8/5/2015.
 */
angular.module('App').directive('postDetail', function ($http, $rootScope, $modal, $location, $modalStack ) {
  var postDetail = {};
  postDetail.restrict = 'A';
  postDetail.scope = {
    backState: '@backState',
    changePage: '@changePage'
  }
  postDetail.link = function (scope, elem, att) {
    var post_id = att.postDetail;
    var back_state = scope.backState || '/';
    elem.on('click', function (e) {
      if (post_id && e.which === 1) {
        if(scope.changePage == 'true'){
          $modalStack.dismissAll();
          $location.path('/post/' + post_id,true);
        } else {
          $location.path('/post/' + post_id, false);
          $modal.open({
            animation: false,
            templateUrl: '/ang/pages/post-detail',
            controller: ModalPostDetailController,
            windowClass: 'post-detail-modal',
            resolve: {
              post_id: function () {
                return post_id;
              },
              back_state: function () {
                return back_state;
              }
            }
          });
        }


      }
    })
  }

  return postDetail;
});

var ModalPostDetailController = function (post_id, back_state, $scope, $http, $sce, $modalInstance, $location, $modal, $rootScope) {
  $scope.show_cancel = true;
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.dismiss = function () {
    $modalInstance.dismiss('forward_state');
  };
  $scope.delete = function (id) {
    $modal.open({
      animation: false,
      template: '<div class="modal-header"><h3 class="modal-title">Delete Post</h3></div><div class="modal-body"><p>{{content}}</p></div><div ng-if="flag" class="modal-footer"> <button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button> <button class="btn btn-primary" type="button" ng-click="confirm()">Confirm</button> </div>',
      controller: deleteModalController,
      resolve: {
        id: function () {
          return id;
        }
      }
    });
  }


  $scope.video_src = ''
  $modalInstance.result.then(function (selectedItem) {
    //$log.info('selectedItem',selectedItem);
  }, function (e) {
    if (e != 'forward_state') {
      if(back_state){
        $location.path(back_state, false);
      } else {
        $location.path('/', true);
      }

    }

  });

  $rootScope.$on('added_a_comment',function(status,data){
    $rootScope.$apply(function(){
      if(data && $scope.postData && $scope.postData._id == data.post_id){
        if($scope.postData && $scope.postData.comments){
          $scope.postData.comments.push(data)
        } else {
          $scope.postData.comments = [];
          $scope.postData.comments.push(data)
        }
      }
    })
  })

  $http.get('/api/posts/get/detail/' + post_id).success(function (data) {
    if (data && !data.error) {
      $scope.postData = data;
      $scope.owned_post = data.posted_by_alias == data.posted_to_alias;
      $scope.isDeletable = false;
      if($rootScope.user && (($rootScope.user.alias && ($rootScope.user.alias._id == data.posted_to_alias)) || ($rootScope.user._id == data.posted_by_user))){
        $scope.isDeletable = true;
      }

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
          $scope.video_src = $sce.trustAsResourceUrl("https://player.vimeo.com/video/" + $scope.postData.video_id)
          break
      }

    } else {
      $scope.cancel();
      $rootScope.alerts = data.error.message;
    }

  })

}

var reportModalController = function (id, $scope, $modalInstance, $http, $modalStack, $timeout, $rootScope) {
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.data = {
    message:'It is not interesting'
  }
  $scope.send = function (data) {
    var data_tobe_sent = data;
    data_tobe_sent.post_id = id;

    $http.post('/api/posts/report', data_tobe_sent).success(function (data) {
      if (data && !data.error) {
        $scope.content = 'Thank you for taking the time to report something that you feel may violate our Community Standards.';

        $timeout(function () {
          $modalStack.dismissAll()
        }, 1300);
      } else {
        $scope.content = data.error.message[0].msg;
        $timeout(function () {
          $modalInstance.dismiss('cancel');
        }, 1300);

      }
    })
  }
}

var deleteModalController = function (id, $scope, $modalInstance, $http, $modalStack, $timeout, $rootScope) {
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.content = 'Are you sure you want to delete this post?';
  $scope.flag = true;
  $scope.confirm = function () {
    $scope.flag = false;
    $http.post('/api/posts/delete', {id: id}).success(function (data) {
      if (data && !data.error) {
        $scope.content = 'Post successfully deleted';

        $timeout(function () {
          $rootScope.$broadcast('refresh_showposts', data);
          $modalStack.dismissAll()
        }, 1300);
      } else {
        $scope.content = 'An error occured please try again latter';
        $timeout(function () {
          $modalInstance.dismiss('cancel');
        }, 1300);

      }
    })
  }
}