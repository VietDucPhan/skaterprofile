//Main Menu Directive
angular.module('App').directive('rightMenu', function (Auth, $modal, $rootScope, $location, $http, FileUploader, Session) {
  var rightMenu = {};
  rightMenu.restrict = 'E';
  rightMenu.link = function (scope) {
    scope.template = function () {
      if (Session.get()) {
        return '/ang/elements/menues/loggedin-right-mainmenu';
      }
      return '/ang/elements/menues/right-mainmenu';
    }

    scope.signup = function () {
      var loginModalInstance = $modal.open({
        animation: true,
        templateUrl: '/ang/users/signup',
        controller: SignUpController

      });
    }
    scope.login = function () {
      $modal.open({
        animation: true,
        templateUrl: '/ang/users/login',
        controller: LoginController
      });
    }

    scope.uploadImage = function (FileUploader){
      $modal.open({
        animation: true,
        templateUrl: '/ang/users/uploadImage',
        controller: UploadImageController
      });
    }

    scope.uploadVideo = function (){
      $modal.open({
        animation: true,
        templateUrl: '/ang/users/uploadVideo',
        controller: UploadVideoController
      });
    }

  }
  rightMenu.template = '<ul class="nav navbar-nav navbar-right" ng-include="template()"/>';
  return rightMenu;
});
var UploadVideoController = function($scope,$modalInstance,$http,$rootScope,$timeout){
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.closePopUpAlerts = function (index) {
    $scope.popUpAlerts.splice(index, 1);
  };

  var youtube_pattern = /^http(?:s)?:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)(?:\S+)?$/i;
  var vimeo_pattern = /^http(?:s)?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)$/i;

  $scope.postVideo = function(data){
    if(youtube_pattern.test(data.video) || vimeo_pattern.test(data.video)){
      $http.post('/api/users/post-video',data).success(function(res){
        if(res && res.error){
          $scope.popUpAlerts = res.error.message;
        } else {
          $scope.popUpAlerts = res.message;
        }


        $timeout(function () {
          $scope.popUpAlerts.splice(0, 1);
          $modalInstance.close()
        }, 3000);
      }).error(function(res){
        $rootScope.popUpAlerts = [{msg:'An unexpected error happened, please try again, lattttter!!!',type:'warning'}]
      })
    } else {
      $rootScope.popUpAlerts = [{msg:'We currently only suppose youtube and vimeo link',type:'warning'}]
    }

  }
}
var UploadImageController = function($scope, FileUploader, $modalInstance, Session, $rootScope,$timeout){
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.closePopUpAlerts = function (index) {
    $scope.popUpAlerts.splice(index, 1);
  };

  $scope.postTitle = '';
  var postImage = $scope.postImage = new FileUploader({
    url: '/api/users/post-image',
    removeAfterUpload: true
  })

  postImage.onAfterAddingFile = function(fileItem) {
    fileItem.formData.push({token:Session.get()})
    fileItem.headers.token = Session.get();

  };

  postImage.onBeforeUploadItem = function(item){
    item.headers.msg = $scope.postTitle;
  }

  postImage.onSuccessItem = function(fileItem, response) {
    console.log(response)
    if (response && response.error) {
      $scope.popUpAlerts = response.error.message;
    } else {
      $scope.popUpAlerts = response.response.message;

      $timeout(function () {
        $scope.popUpAlerts.splice(0, 1);
        $modalInstance.close()
      }, 3000);
    }
  };


}

var SignUpController = function (Auth, $scope, $modalInstance, $rootScope, $location, $http, Facebook, $timeout) {
  $scope.fbLogin = function () {
    Facebook.login();
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.signUpSubmit = function (data) {
    $http({
      method: 'POST',
      url: '/api/users/signup',
      data: data,  // pass in data as strings
      headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not
      // request payload)
    }).success(function (data) {

      if (data && data.error) {
        $rootScope.signUpPopUpAlerts = data.error.message

      } else {
        $rootScope.signUpPopUpAlerts = data.message
        $timeout(function () {
          $modalInstance.close()
        }, 3000);
      }
    });
  }
  $rootScope.closeSignUpPopUpAlert = function (index) {
    $rootScope.signUpPopUpAlerts.splice(index, 1);
  };
};

var LoginController = function (Auth, $scope, $modalInstance, $rootScope) {
  $scope.loginSubmit = function (data) {
    Auth.login(data, function (msg) {
      if (msg.length > 0) {
        return $rootScope.popUpLoginAlerts = msg;
      }
      $modalInstance.close();
    });
  }
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $rootScope.closeLoginPopUpAlert = function (index) {
    $rootScope.popUpLoginAlerts.splice(index, 1);
  };
};
