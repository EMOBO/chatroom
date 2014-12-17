var msgHandler = require('./message');
exports.handle = function(io, socket, chatList) {
  var roomID = socket.handshake.headers.referer.toString().split('roomID=')[1];
  var p2pFromUsername = socket.handshake.headers.referer.toString().split('~')[0].split('roomID=')[1],
    p2pToUsername = socket.handshake.headers.referer.toString().split('~')[1];
  var p2pFromUser = chatList.find(p2pFromUsername)[0],
    p2pToUser = chatList.find(p2pToUsername)[0];
  var welcomeInfo = {
    p2pFromUser: p2pFromUser,
    p2pToUser: p2pToUser
  };

  socket.join(roomID);
  io.sockets.in(roomID).emit('p2pWelcome', welcomeInfo);

  socket.on('p2pMessage', function(p2pMessage) {
    switch (p2pMessage.action) {
      case 'p2pChat':
        console.log('服务器将为' + p2pMessage.data.username + '转发p2p消息：');
        console.log(p2pMessage);
        io.sockets.in(roomID).emit('p2pMessage', p2pMessage);
        break;
    }
  });

  socket.on('disconnect', function() {
    io.sockets.in(roomID).emit('p2pDisconnect', {
      message: '对方离开房间了'
    });
  });
};