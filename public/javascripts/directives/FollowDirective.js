//Main Menu Directive
angular.module('App').directive('followButton', function ($location,Session) {
  var followButton = {};
  followButton.restrict = 'A';
  followButton.link = function (scope, ele, att) {
    scope.followTemplate = function (){
      var loggedInUser = Session.get();
      return '<button class="btn" ng-include="followTemplate()">Your profile</button>'
      if(loggedInUser && loggedInUser.alias && att.followButton === loggedInUser.alias._id){
        return '<button class="btn" ng-include="followTemplate()">Your profile</button>'
      } else {
        return '<button class="btn" ng-include="followTemplate()">Follow ab</button>';
      }
    }

  }

  followButton.template = '<button class="btn" ng-include="followTemplate()">Follow</button>'
  return followButton;
});


