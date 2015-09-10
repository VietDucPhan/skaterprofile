//Main Menu Directive
angular.module('App').directive('chat', function (Socket, $rootScope) {
    var chat = {};
    chat.restrict = 'E';
    chat.templateUrl = function () {
        return '/ang/elements/chat/sample'
    }

    chat.controller = function ($scope) {
        if (!Socket) {
            console.log('not login');
            return false;
        }
        Socket.getAllOnlineUsers(function (data) {
            $scope.users_list = data;
        });
        $scope.send = function (data) {
            Socket.emit('message', data);
        }

        Socket.listen('chat', function (data) {
            var element = angular.element(document.querySelector("td#chat-box"));
            element.append('<blockquote><p>'+data.msg+'</p><footer>From <cite title="Source Title">'+data.sender+'</cite></footer></blockquote>');
        })


    }
    return chat;
});


