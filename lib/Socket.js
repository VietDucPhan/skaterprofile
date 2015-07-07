var Socket = module.exports = {};
var io = require('socket.io');
Socket.listen = function(server,callback){
  Socket.io = io.listen(server);
  Socket.io.on('connection',Socket.connections)
  if(typeof callback == 'function'){
    return callback();
  }
}

Socket.connections = function(socket){
  socket.on('click',function(data){
    console.log(socket.client.id);
    Socket.io.sockets.emit('click',socket.client.id);
  });
}