var msgHandler = require('./message');
var fileHandler = require('./fileHandler');
var textHandler = require('./textHandler');

var FILE_TYPE = 'FILE';
var TEXT_TYPE = 'TEXT';


exports.handle = function(socket, message) {

	var response;
	switch (message.data.content.type) {
		case FILE_TYPE:
			response = fileHandler.handle(message);
			break;
		case TEXT_TYPE:
			response = textHandler.handle(message);
			break;
	}
	
	console.log('服务器将为' + message.data.username + '广播broadcast消息：');
	//console.log(message);
	socket.broadcast.emit('response', response);
	socket.emit('response', response);
};
