//Main Menu Directive
angular.module('App').directive('ngActive', function ($location) {
    var ngActive = {};
    ngActive.restrict = 'A';
    ngActive.link = function(scope,ele,att){
        if($location.path() == att.href){
            ele.addClass('active');
        }
    }
    return ngActive;
});


