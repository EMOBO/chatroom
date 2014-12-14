var msgHandler = require('./message');
var FILE_TYPE = 'FILE';
var TEXT_TYPE = 'TEXT';
exports.handle = function(message) {
	var _source = {
		ip: message.destination.ip,
		port: message.destination.port
	};
	var _destination = {
		ip: message.source.ip,
		port: message.source.port
	};

	var _statusCode = 500;
	return msgHandler.packageResponseMessage(
		_statusCode,
		_source,
		_destination,
		textHandler(message));
};

/**
 *	Text Handle Function
 *	Return Response.data
 **/
function textHandler(message) {
	console.log(message.data);
	return message.data;
}