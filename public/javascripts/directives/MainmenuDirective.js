//Main Menu Directive
angular.module('App').directive('mainMenu',function(){
    var mainMenu = {};
    mainMenu.restrict = 'E',
    mainMenu.templateUrl = function(){
        return '/ang/elements/menues/mainmenu'
    }
    return mainMenu;
});


