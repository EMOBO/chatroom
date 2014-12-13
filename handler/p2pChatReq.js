var msgHandler = require('./message');
exports.handle = function(socket, message, chatList) {
  var p2pFromUsername = message.data.p2pFromUsername,
    p2pFromUser = chatList.find(p2pFromUsername)[0],
    p2pToUsername = message.data.p2pToUsername,
    p2pToUser = chatList.find(p2pToUsername)[0];

  var _statusCode = 600;
  var _source = {
    ip: p2pFromUser.ip,
    port: p2pFromUser.port
  };
  var _destination = {
    ip: p2pToUser.ip,
    port: p2pToUser.port
  };

  var _data = {
    roomID: message.data.roomID,
    p2pFromUser: p2pFromUser,
    p2pToUser: p2pToUser
  };

  var response = msgHandler.packageResponseMessage(_statusCode, _source, _destination, _data);
  socket.broadcast.emit('response', response);
};