//Main Menu Directive
angular.module('App').directive('ngActive', function ($location, $rootScope) {
    var ngActive = {};
    ngActive.restrict = 'A';
    ngActive.link = function(scope,ele,att){
      $rootScope.$on('$routeChangeStart', function (event, next) {
        if($location.path() == att.href){
          ele.parent().addClass('active');
        } else {
          ele.parent().removeClass('active')
        }
      })

    }
    return ngActive;
});


