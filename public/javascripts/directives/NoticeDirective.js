//Main Menu Directive
angular.module('App').directive('ngNotice', function ($location, Session, $http, $rootScope, $cacheFactory) {
  var ngNotice = {};
  ngNotice.restrict = 'A';
  ngNotice.templateUrl = '/ang/elements/menues/notifications'
  ngNotice.link = function (scope, ele, att) {
    var notice = function () {
      var notice_length = $rootScope.notifications ? $rootScope.notifications.length : 0;
      var get_count_notice = function (an_array) {
        if (notice_length != 0) {
          var read = 0;
          an_array.forEach(function (e) {
            if (e.read != 1) {
              read++;
            }
          })
          return read;
        } else {
          return notice_length;
        }
      }

      scope.count_notice = get_count_notice($rootScope.notifications)
      scope.notification_list = $rootScope.notifications;
      if (scope.count_notice != 0) {
        $rootScope.count_notice = "(" + scope.count_notice + ") ";
      }
    }
    scope.setToRead = function () {
      if($rootScope.count_notice != 0 && $rootScope.count_notice != null ){
        $http.post('/api/users/set-notice-to-read', {}).success(function (res) {
          var set_notice_to_read = function (an_array) {
            if ($rootScope.notifications.length != 0) {
              var i = 0;
              $rootScope.notifications.forEach(function (e) {
                if (e.read != 1) {
                  $rootScope.notifications[i].read = 1;
                }
                i++;
              })
            }
          }
          if (res && !res.error) {
            scope.count_notice = 0;
            $rootScope.count_notice = null;
            set_notice_to_read()

          }
        })
      }

    }
    notice();
    $rootScope.$watch('notifications', function () {
      notice();
    })
    $rootScope.$on('notification', function (data) {
      $rootScope.$apply(function () {
        notice();
      })

    })
  }
  return ngNotice;
});


