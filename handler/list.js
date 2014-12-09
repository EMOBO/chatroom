var msgHandler = require('./message');
var _statusCode, _source, _destination, _data;
var response;
exports.handle = function (socket, message, chatList) {
	_source = {
		ip: message.destination.ip,
		port: message.destination.port
	};
	_destination = {
		ip: message.source.ip,
		port: message.source.port
	};
	if (chatList.userlist != []) {
		_statusCode = 400;
		_data = chatList.userlist;
		response = msgHandler.packageResponseMessage(_statusCode, _source, _destination, _data);
	} else {
		_statusCode = 404;
		_data = "Cant get online chaters list!";
		response = msgHandler.packageResponseMessage(_statusCode, _source, _destination, _data);
	}
	socket.broadcast.emit('response', response);
	socket.emit('response', response);
};