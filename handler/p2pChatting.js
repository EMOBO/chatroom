var msgHandler = require('./message');
exports.handle = function(io, socket) {
  var roomID = socket.handshake.headers.referer.toString().split('roomID=')[1];
  socket.join(roomID);
  socket.on('p2pMessage', function(p2pMessage) {
    if(p2pMessage.action == 'p2pChat') {
      console.log('服务器将为' + p2pMessage.data.username + '转发p2p消息：');
      console.log(p2pMessage);
      io.sockets.in(roomID).emit('p2pMessage', p2pMessage);
    }
  });
};