//Main Menu Directive
angular.module('App').directive('aliasTemplate', function ($location) {
  var aliasTemplate = {};
  aliasTemplate.restrict = 'A';
  aliasTemplate.link = function (scope, ele, att) {
    console.log(ele)
    att.$observe('aliasTemplate', function (value) {
      if (value) {
        console.log(value);
        // pass value to app controller
        $scope.variable = value;
      }
    });
  }
  return aliasTemplate;
});


