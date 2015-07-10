//Main Menu Directive
angular.module('App').directive('rightMenu',function(Auth){
    var rightMenu = {};
    rightMenu.restrict = 'E';
    rightMenu.link = function(scope,templateRequest){
        if(Auth.isAuthenticated()){
            scope.template = '/ang/elements/menues/loggedin-right-mainmenu';
        } else {
            scope.template = '/ang/elements/menues/right-mainmenu'; 
        }

    }
    rightMenu.template = '<ul class="nav navbar-nav navbar-right" ng-include src="template"/>';
    return rightMenu;
});


