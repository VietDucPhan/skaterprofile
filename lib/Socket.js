var Socket = module.exports = {};
var io = require('socket.io');
Socket.listen = function(server,callback){
  Socket.io = io.listen(server);
  if(typeof callback == 'function'){
    return callback();
  }
}

Socket.sendEmit = function(EmitName,Msg){
  Socket.io.sockets.emit(EmitName,Msg)
}
