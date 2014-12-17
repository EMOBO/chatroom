(function() {
	/*********************************** variable ******************************/
	var TEXT_TYPE = 'TEXT';
	var FILE_TYPE = 'FILE';
	var IP;
	var _source;
	var _destination = {
		ip: '127.0.0.1',
		portaddr: '3000'
	};
	var _cookie = 'cookie null';

	/************************************ function ********************************/
	function message(type, cont, filename) {
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
			type: TEXT_TYPE,
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
	 *  清屏函数
	 **/
	function cleanScreen() {
		$('#chat-dynamic').empty();
		$('#chat-dynamic').append("<p style='font-weight:bold;font-size:20px;text-align:center;')> 系统：欢迎来到聊天室大厅</p>");
	}

	/*	*
	 *	get online chaters list
	 * return
	 **/
	function getChatList() {
		socket.emit('message', packageMessage(
			'list',
			_source,
			_destination,
			_cookie,
			'null'
		));
	}



	/**
	 *  消息发送函数
	 **/
	function sendMessage() {
		socket.emit('message', message(TEXT_TYPE, $('#message-box input').val()));
		$('#message-box input').val('');
	}

	/**
	 *  消息框更新函数
	 **/
	function updateMessageBox(message) {
		switch (message.content.type) {
			case FILE_TYPE:
				if ($('#file-' + message.content.fileNumber + '-bar>.progress-bar').css('width') === undefined)
					createFileMessageBox(message);
				updateMessageBox_File(message);
				break;
			case TEXT_TYPE:
				updateMessageBox_Text(message);
				break;
		}
	}

	function updateMessageBox_File(message) {
		//console.log(message);
		if (message.address === undefined) {
			$('#file-' + message.content.fileNumber + '-bar>.progress-bar').css('width', message.content.percentage + '%');
			$('#file-' + message.content.fileNumber + '-bar>.progress-bar').text(message.content.percentage + '%');
		} else {
			$('#file-' + message.content.fileNumber + '-bar>.progress-bar').css('width', '100%');
			$('#file-' + message.content.fileNumber + '-bar>.progress-bar').text('100%');
			setTimeout(function() {
				$('#file-' + message.content.fileNumber + '-box>p>a').attr('href', message.address);
				$('#file-' + message.content.fileNumber + '-box>p>a>img').attr('src', 'img/filedone.png');
				$('#file-' + message.content.fileNumber + '-box>p').css('background-color', '#9DFFB0');
				$('#file-' + message.content.fileNumber + '-bar').remove();
			}, 1000);
		}
	}

	function createFileMessageBox(message) {
		var element = '<div class="fileBox" id="file-' + message.content.fileNumber + '-box"><p><b>(' + message.time + ') ' + message.username +
			' : </b>' + message.content.filename +
			'<a target="_blank"><img src = "img/loading2.gif"></img></a></p><div id="file-' +
			message.content.fileNumber +
			'-bar" class="progress"><div class="progress-bar" role="progressbar"' +
			' aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%' +
			'</div></div></div>';
		$('#chat-dynamic').append(element);
		$('#file-' + message.content.fileNumber + '-bar').css('width', $('#file-' + message.content.fileNumber + '-box>p').css('width'));
		var scrollHeight = $('#chat-dynamic').height() - $('#chat-box').height();
		$('#chat-box').scrollTop(scrollHeight);
	}

	function updateMessageBox_Text(message) {
		$('#chat-dynamic').append('<p><b>(' + message.time + ') ' + message.username + ' : </b>' + message.content.content + '</p>');
		var scrollHeight = $('#chat-dynamic').height() - $('#chat-box').height();
		$('#chat-box').scrollTop(scrollHeight);
	}

	/**
	 *	updateChatList() function
	 *
	 **/
	function updateChatList(namelist) {
		if (namelist === undefined) return;
		var chatlist = "";
		for (var i = 0; i < namelist.length; i++) {
			chatlist = chatlist + "<tr><td width='100px'>" + namelist[i] + "</td></tr>";
		}
		$('#chat-list').html(chatlist);
	}

	/*************************************** Event ********************************/

	socket.on('welcome', function(ip) {
		IP = ip;
		_source = {
			ip: IP,
			portaddr: '8888'
		};
		getChatList();
	});

	socket.on('response', function(response) {
		switch (response.statusCode) {
			case 400:
				updateChatList(response.data);
				break;
			case 404:
				handleChatListError();
				break;
			case 500:
				updateMessageBox(response.data);
				break;
		}
	});

	//主动获取chatList
	$(document).ready(function() {
		setUser();
		getChatList();
	});
	/**
	 *  发送消息
	 **/
	//按下Enter
	$('#message-box input').keydown(function(e) {
		if (e.keyCode === 13) {
			$('#send-message').click();
		}
	});
	//点击发送按钮
	$('#send-message').click(function() {
		sendMessage();
	});

	/**
	 *  清除屏幕现有消息
	 **/
	//按下Esc
	$('body').keydown(function(e) {
		if (e.keyCode === 27) {
			$('#clean-box').click();
		}
	});

	//点击清屏按钮
	$('#clean-box').on('click', cleanScreen);

})();;(function(){
	var socket = io();
	$("#message-send").click(function() {
		console.log($("#message-input").val());
		socket.emit('chat message', $("#message-input").val());
		$("message-input").val('');
	});
	socket.on('chat message', function(msg) {
		console.log(msg);
		$("#chatroom").append($("<p>").text(msg));
	});
})();;(function() {
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


})();;(function() {
	var socket = io();
	var _source = '';
	var _destination = '';
	var _cookie = 'null cookie';
	var _data = '';
	//welcome socket
	socket.on('welcome', function(userIp) {
		_source = {
			ip: userIp,
			portaddr: '8888'
		};
		_destination = {
			ip: '127.0.0.1',
			portaddr: '3000'
		};
		//按下Enter
		$('#login-form').keydown(function(e) {
			if (e.keyCode === 13) {
				$('#btn-login').click();
			}
		});
		//login
		$('#btn-login').on('click', function() {
			var _username = $('#login-user input').val();
			var _password = $('#login-password input').val();
			//login data
			_data = {
				username: _username,
				password: _password
			};
			//package message
			var message = packageMessage('login', _source, _destination, _cookie, _data);
			//emit
			socket.emit('message', message);
		});

		socket.on('response', function(response) {
			if (response.statusCode == 204) {
				alert(response.data);
				$('#login-password input').val('');
			}
			if (response.statusCode == 200) {
				alert('欢迎回来 ' + response.data + ' !');
				USERNAME = response.data;
				window.location = '/chat?' + USERNAME;
			}
		});
	});
})();;(function() {
	var socket = io();
	var _source = '';
	var _destination = '';
	var _cookie = 'null cookie';
	var _data = '';
	//welcome socket
	socket.on('welcome', function(userIp) {
		_source = {
			ip: userIp,
			portaddr: '8888'
		};
		_destination = {
			ip: '127.0.0.1',
			portaddr: '3000'
		};

		//登出时间触发
		$('#logout').on('click', function() {
			var _username = $('#login-user input').val();
			var _password = $('#login-password input').val();
			//login data
			_data =  getUser();
			//package message
			var message = packageMessage('logout', _source, _destination, _cookie, _data);
			//emit
			socket.emit('message', message);
		});

		//接受报文
		socket.on('response', function(response) {
			if (response.statusCode == 304) {
				alert(response.data);
			}
			if (response.statusCode == 300) {
				alert('退出成功，欢迎下次再来！');
				window.location = '/';
			}
		});
	});
})();;(function() {
	var socket = io();
	socket.on('welcome', function(ip) {
		//注册
		$('#register-apply').on('click', function() {
			var username = $('#register-username input').val();
			var password = $('#register-password input').val();
									USERNAME = username;
			var passwordComfirm = $('#register-password-confirm input').val();
			console.log('username:' + username + '|password:' + password + '|passwordComfirm:' + passwordComfirm);
			//是否为空
			if ((password === '') || (username === '')) {
				alert('密码和用户名不能为空，请重新输入！');
				clear();
			} else {
				//面膜六位以上
				if (password.length < 6) {
					alert('密码至少为6位，请重新输入！');
					clear();
				} else {
					//两次输入密码是否相同
					if (password == passwordComfirm) {
						var user = {
							username: username,
							password: password
						};
						var sourceIp = ip;
						console.log(sourceIp);
						var _source = {
							ip: sourceIp,
							portaddr: '8888'
						};
						var _destination = {
							ip: '127.0.0.1',
							portaddr: '3000'
						};
						var _cookie = 'cookie null';
						var message = packageMessage('register', _source, _destination, _cookie, user);
						console.log(message);
						console.log(user);

						socket.emit('message', message);
					} else {
						alert('两次输入密码不一致，请重新输入！');
						clear();
					}
				}
			}

		});
		socket.on('response', function(response) {
			if (response.statusCode == 104) {
				alert(response.data);
				clear();
				$('#register-username input').val('');
			}
			if (response.statusCode == 100) {
				alert('恭喜！注册成功！');
				window.location = '/chat?'+$('#register-username input').val();
			}
		});

		//按下Enter
		$('#register-form').keydown(function(e) {
			if (e.keyCode === 13) {
				$('#register-apply').click();
			}
		});
	});

	function clear() {
		$('#register-password input').val('');
		$('#register-password-confirm input').val('');
	}
})();