var msgHandler = require('./message');
var FILE_TYPE = 'FILE';
var TEXT_TYPE = 'TEXT';

/** Sensitive words:
* ENG：fuck  shit damn
* CHN : 艹 操 妈逼 日你妈 共产 水表
* use http://javawind.net/tools/native2ascii.jsp?action=transform
**/
var SensitiveReq =/(fuck|shit|damn|\u8279|\u64cd|\u5171\u4ea7|\u6c34\u8868|\u5988\u903c|\u65e5\u4f60\u5988)/ig;

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
	message.data.content.content = textShield(message.data.content.content);
	return message.data;
}

/**
*	Sensitive Words Block
*	return Text after handled
**/
function textShield(data) {
	/** block four-letters word && chinese Sensitive words **/

	data = data.replace(SensitiveReq, function(word) {
		var str = '';
		for (var i = 0; i < word.length; i ++) {
			str +='*';
		}
		return str;
	});
	return data;
}