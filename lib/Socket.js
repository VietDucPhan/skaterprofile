var Socket = module.exports = {};
var io = require('socket.io');
var Auth = require('../lib/Auth');
var users = {};

Socket.listen = function (server, callback) {
    Socket.io = io.listen(server);
    Socket.io.on('connection', Socket.connections)

    if (typeof callback == 'function') {
        return callback();
    }
}

Socket.connections = function (socket) {
    socket.on('token',function(token){
        Auth.jwtDecode(token,function(decoded){
            socket.join(decoded.data.userid);
            users[decoded.data.userid.toString()] = decoded.data;
            console.log(users);
            Socket.io.sockets.emit('UsersOnline',users);
        });
    });


    socket.on('message', function (data) {
        var message = {};
        message.sender = users[data.id].email;
        message.msg = data.message
        socket.to(data.id).emit('chat', message);
    });

    socket.on( 'disconnect', function() {
        console.log('disconnect: ' + socket.id);
    });

    socket.on( 'connect_failed', function() {
        console.log('connect_failed');
    });

    socket.on( 'error', function() {
        console.log('error');
    });


}