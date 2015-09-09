//Main Menu Directive
angular.module('App').directive('voteButtons', function ($location, Session, $http, $rootScope, Socket) {
  var VoteButtons = {};
  VoteButtons.restrict = 'A';
  VoteButtons.templateUrl = '/ang/elements/vote-buttons/button'
  VoteButtons.link = function (scope, ele, att) {
    var post_id = att.voteButtons;
    scope.up_vote_class = 'default';
    scope.down_vote_class = 'default';
    scope.up_votes_number = 0;
    scope.down_votes_number = 0;
    scope.post_id = post_id
    var up_votes_id = [];
    var down_votes_id = [];


    if (post_id) {
      $http.get('/api/posts/get-votes/' + post_id).success(function (res) {
        if (res && !res.error) {
          up_votes_id = res.response.up_votes;
          down_votes_id = res.response.down_votes;
          if (up_votes_id) {
            scope.up_votes_number = up_votes_id.length;
          }

          if (down_votes_id) {
            scope.down_votes_number = -down_votes_id.length;
          }

          if ($rootScope.user && up_votes_id && up_votes_id.indexOf($rootScope.user._id) != -1) {
            scope.up_vote_class = 'success';
          }

          if ($rootScope.user && down_votes_id && down_votes_id.indexOf($rootScope.user._id) != -1) {
            scope.down_vote_class = 'danger';
          }

        }
      })

      scope.thumb_up = function () {
        $http.post('/api/posts/up-vote/' + post_id).success(function (res) {
          if (res && !res.error) {
            Socket.emit('vote_action', res.response)
          } else {
            $rootScope.alerts = res.error.message;
          }
        })
      }

      scope.thumb_down = function () {
        $http.post('/api/posts/down-vote/' + post_id).success(function (res) {
          if (res && !res.error) {
            Socket.emit('vote_action', res.response)
          } else {
            $rootScope.alerts = res.error.message;
          }
        })
      }
      $rootScope.$on('vote_action', function (event, res) {
        if (res && res._id == post_id) {
          $rootScope.$apply(function () {
            if (res && !res.error) {
              up_votes_id = res.up_votes;
              down_votes_id = res.down_votes;
              if (up_votes_id) {
                scope.up_votes_number = up_votes_id.length;
              }

              if (down_votes_id) {
                scope.down_votes_number = -down_votes_id.length;
              }

              if ($rootScope.user && up_votes_id && up_votes_id.indexOf($rootScope.user._id) != -1) {
                scope.up_vote_class = 'success';
              } else {
                scope.up_vote_class = 'default';
              }

              if ($rootScope.user && down_votes_id && down_votes_id.indexOf($rootScope.user._id) != -1) {
                scope.down_vote_class = 'danger';
              } else {
                scope.down_vote_class = 'default';
              }

            }
          })
        }
      })
    }

  }
  return VoteButtons;
});


