//Main Menu Directive
angular.module('App').directive('rightMenu',function(Auth){
    var rightMenu = {};
    rightMenu.restrict = 'E';
    rightMenu.link = function(scope){
        scope.template = function(){
            if(scope.user){
                return '/ang/elements/menues/loggedin-right-mainmenu';
            }
            return '/ang/elements/menues/right-mainmenu';
        }

    }
    rightMenu.template = '<ul class="nav navbar-nav navbar-right" ng-include="template()"/>';
    return rightMenu;
});


