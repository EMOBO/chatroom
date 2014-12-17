(function() {
	/*********************************** variable ******************************/
	var FILE_TYPE = 'FILE';
	var FILE_LIMITSIZE = 5242880;
	var file = {
		name: '',
		file: '',
		size: 0
	};
	var socket = io();
	var IP;
	var _source;
	var _destination = {
		ip: '127.0.0.1',
		portaddr: '3000'
	};
	var _cookie = 'cookie null';
	var fileReader = new FileReader();

	/************************************ function ********************************/
	function filePackage(type, cont, filename) {
		var content;
		var username = USERNAME;
		var date = new Date(),
			time;
		var hour = date.getHours(),
			minute = date.getMinutes(),
			seconds = date.getSeconds();
		var hour_str = (hour > 9) ? hour.toString() : ('0' + hour.toString()),
			minute_str = (minute > 9) ? minute.toString() : ('0' + minute.toString()),
			seconds_str = (seconds > 9) ? seconds.toString() : ('0' + seconds.toString());

		content = {
			type: FILE_TYPE,
			filename: filename,
			filesize: file.size,
			content: cont
		};

		if (hour > 12) {
			time = hour_str + ':' + minute_str + ':' + seconds_str + '  PM';
		} else {
			time = hour_str + ':' + minute_str + ':' + seconds_str + '  AM';
		}

		return packageMessage(
			'broadcast',
			_source,
			_destination,
			_cookie, {
				username: username,
				time: time,
				content: content
			}
		);
	}


	/**
	 * 文件检测函数
	 **/
	function isFileExist() {
		return $("#file-upload").val() !== '';
	}



	/**
	 *  消息发送函数
	 **/
	function sendFile() {
		var startPoint = 0,
			endPoint = file.file.size;
		var FINISHREAD = true;
		if ($("#file-upload").val() !== '') {
			/**
			 * 这里是用的一个闭包方法取消忙等待（to do）
			 **/
			fileRead(fileSplice(startPoint, endPoint, file.file));
		} else {
			alert("你没有选择文件！");
		}

		$('#file-upload').val('');

		fileReader.onprogress = function(event) {
			console.log(event.lengthComputable, event.loaded, event.total);
		};

		fileReader.onerror = function() {
			console.log("something wrong, CODE: " + fileReader.error.code);
		};

		fileReader.onload = function() {
			// 每一个chunk load完发送进入load下一块chunk的过程

			socket.emit('message', filePackage(FILE_TYPE, {
				data: fileReader.result,
				Final: startPoint + FILE_LIMITSIZE >= endPoint ? true : false
			}, file.name));
			FINISHREAD = true;
			startPoint += FILE_LIMITSIZE;
			return (function() {
				fileRead(fileSplice(startPoint, endPoint, file.file));
			})();

		};

		/**
		 * 文件读取函数
		 **/
		function fileRead(f) {
			if (FINISHREAD) {
				if (f.size !== 0) {
					fileReader.readAsBinaryString(f);
					FINISHREAD = false;
				}
			}
		}

		/**
		 * 文件分块函数
		 **/
		function fileSplice(startPoint, endPoint, f) {
			try {
				if (f.slice) {
					return f.slice(startPoint, startPoint + Math.min(endPoint - startPoint, FILE_LIMITSIZE));
				}
			} catch (e) {
				console.log(e);
				alert('你的浏览器不支持上传');
			}
		}

	}



	/*************************************** Event ********************************/

	socket.on('welcome', function(ip) {
		IP = ip;
		_source = {
			ip: IP,
			portaddr: '8888'
		};
	});


	//点击发送按钮
	$('#send-file').click(function() {
		sendFile();
	});

	// 改变input file
	$("#file-upload").change(function() {
		if ($('#file-upload').val() !== null) {
			file.name = ($("#file-upload")[0].files)[0].name;
			file.file = ($("#file-upload")[0].files)[0];
			file.size = file.file.size;

		} else {
			file = {
				name: '',
				file: '',
				size: 0
			};
		}
	});


})();