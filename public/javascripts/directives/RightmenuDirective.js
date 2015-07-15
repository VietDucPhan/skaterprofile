//Main Menu Directive
angular.module('App').directive('rightMenu',function(Auth,$modal,$rootScope,$location,$http){
    var rightMenu = {};
    rightMenu.restrict = 'E';
    rightMenu.link = function(scope){
        scope.template = function(){
            if(scope.user){
                return '/ang/elements/menues/loggedin-right-mainmenu';
            }
            return '/ang/elements/menues/right-mainmenu';
        }

        scope.signup = function(){
            var loginModalInstance = $modal.open({
                animation: true,
                templateUrl: '/ang/users/signup',
                controller: SignUpController

            });
        }
        scope.login = function(){
            $modal.open({
                animation: true,
                templateUrl: '/ang/users/login',
                controller: LoginController
            });
        }
        scope.alias = {
            profile_img:false//"https://lh6.googleusercontent.com/-zkNCtidqyL0/AAAAAAAAAAI/AAAAAAAAAAA/tFR30lDzjiw/w48-h48/photo.jpg"
        };

    }
    rightMenu.template = '<ul class="nav navbar-nav navbar-right" ng-include="template()"/>';
    return rightMenu;
});

var SignUpController = function (Auth, $scope, $modalInstance, $rootScope, $location,$http) {
    $scope.signUpSubmit = function (data) {
        $http({
            method: 'POST',
            url: '/api/users/signup',
            data: data,  // pass in data as strings
            headers: {'Content-Type': 'application/json'}  // set the headers so angular passing info as form data (not
            // request payload)
        }).success(function (data) {
            if(data.success){
                $modalInstance.close();
            } else {
                $rootScope.signUpPopUpAlerts = data.msg
            }
        });
    }
    $rootScope.closeSignUpPopUpAlert = function(index) {
        $rootScope.signUpPopUpAlerts.splice(index, 1);
    };
};

var LoginController = function (Auth, $scope, $modalInstance, $rootScope) {
    $scope.loginSubmit = function (data) {
        Auth.login(data,function(msg){
            if(msg.length > 0){
                return $rootScope.popUpLoginAlerts = msg;
            }
            $modalInstance.close();
        });
    }
    $rootScope.closeLoginPopUpAlert = function(index) {
        $rootScope.popUpLoginAlerts.splice(index, 1);
    };
};
