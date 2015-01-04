var msgHandler = require('./message');
var fileHandler = require('./fileHandler');
var textHandler = require('./textHandler');

var FILE_TYPE = 'FILE';
var TEXT_TYPE = 'TEXT';

exports.handle = function(io, socket, chatList) {
  var roomID = decodeURIComponent(socket.handshake.headers.referer.toString().split('roomID=')[1]);
  var p2pFromUsername = decodeURIComponent(socket.handshake.headers.referer.toString().split('~')[0].split('roomID=')[1]),
    p2pToUsername = decodeURIComponent(socket.handshake.headers.referer.toString().split('~')[1]);
  var p2pFromUser = chatList.find(p2pFromUsername)[0],
    p2pToUser = chatList.find(p2pToUsername)[0];
  var welcomeInfo = {
    p2pFromUser: p2pFromUser,
    p2pToUser: p2pToUser
  };

  socket.join(roomID);
  io.sockets.in(roomID).emit('p2pWelcome', welcomeInfo);

  var response;

  socket.on('p2pMessage', function(p2pMessage) {
    if (p2pMessage.action === 'p2pChat') {
      console.log('服务器将为' + p2pMessage.data.username + '转发p2p消息：');
      // console.log(p2pMessage);
      switch (p2pMessage.data.content.type) {
        case FILE_TYPE:
          response = fileHandler.handle(p2pMessage);
          break;
        case TEXT_TYPE:
          response = textHandler.handle(p2pMessage);
          break;
      }
      io.sockets.in(roomID).emit('p2pMessage', response);
    }
  });

  socket.on('disconnect', function() {
    io.sockets.in(roomID).emit('p2pDisconnect', {
      message: '对方离开私聊房间了'
    });
  });
};