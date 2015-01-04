var msgHandler = require('./message');
var crypto = require('crypto');

var fs = require('fs');
var File = [];
var FILE_TYPE = 'FILE';
var TEXT_TYPE = 'TEXT';
/**
 *	File 代表上传文件的信息
 *	同时为多文件上传提供可能
 *	File_End 代表文件是否完结
 *	fileUploadPionter 为已经上传的内容
 *	writeStream 是文件的流
 **/
var UPLOAD_PATH = 'upload/';

fileNumber = 0;
exports.handle = function(message) {
	var _source = {
		ip: message.destination.ip,
		port: message.destination.port
	};
	var _destination = {
		ip: message.source.ip,
		port: message.source.port
	};

	var _statusCode = (message.action === 'p2pChat') ? 600 : 500;
	if (!File[message.data.content.filename]) {
		/** initialize **/
		File[message.data.content.filename] = {
			File_End: true,
			FileUploadPionter: 0,
			writeStream: null
		};
	}


	if (File[message.data.content.filename].writeStream === undefined || File[message.data.content.filename].File_End) {
		File[message.data.content.filename] = {
			File_End: false,
			FileUploadPionter: 0,
			writeStream: fs.createWriteStream(UPLOAD_PATH +
				message.data.content.filename, {
					encoding: 'Binary'
				})
		};
	}
	response = msgHandler.packageResponseMessage(
		_statusCode,
		_source,
		_destination,
		fileHandler(message,
			File[message.data.content.filename].writeStream));
	if (File[message.data.content.filename].File_End) {
		File[message.data.content.filename].writeStream.end();
		delete File[message.data.content.filename];
	}
	defineFileType(message.data.content.filename);
	return response;
};


/**
 *	File Handle Function
 *	Return Response.data
 **/
function fileHandler(message, writeStream) {
	writeStream.write(message.data.content.content.data, 'Binary', function() {
		if (message.data.content.content.Final) {
			writeStream.on('end', function() {
				writeStream.end();
			});
		}
	});
	File[message.data.content.filename].FileUploadPionter += message.data.content.content.data.length;
	// hash filename to web page update progress bar
	var hash = crypto.createHash("md5");
	hash.update(message.data.content.filename);
	var hashCode = hash.digest('hex');
	var responseData = {
		username: message.data.username,
		time: message.data.time,
		content: {
			type: FILE_TYPE,
			fileType: null,
			filename: message.data.content.filename,
			percentage: Math.floor((File[message.data.content.filename].FileUploadPionter /
				message.data.content.filesize) * 100),
			address: null,
			hashCode: hashCode
		}
	};
	if (message.data.content.content.Final) {
		File[message.data.content.filename].File = 0;
		File[message.data.content.filename].File_End = true;
		responseData.address = message.data.content.filename;
		responseData.content.fileType = defineFileType(responseData.content.filename);
		fileNumber++;

	}
	return responseData;
}

/**
 *	judge file type is img type or video type
 **/
function defineFileType(filename) {
	if (isImage(filename)) {
		return 'img';
	}
	if (isVideo(filename)) {
		return 'video';
	} else {
		return 'normal';
	}
}

function isImage(filename) {
	return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename);
}

function isVideo(filename) {
	return (/\.(mp4|mkv|avi|rmvb)$/i).test(filename);
}