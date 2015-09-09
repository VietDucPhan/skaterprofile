//Main Menu Directive
angular.module('App').directive('ngNotice', function ($location, $rootScope, $log) {
  var ngNotice = {};
  ngNotice.restrict = 'A';
  ngNotice.scope = {
    notifications: '='
  };
  ngNotice.template = '<span class="glyphicon glyphicon-bell ng-scope"></span> <span class="badge">{{count_notice}}</span>'
  ngNotice.link = function (scope, ele, att) {

  }
  return ngNotice;
});


