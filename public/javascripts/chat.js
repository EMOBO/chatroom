(function() {
	/*********************************** variable ******************************/
	var FILE_TYPE = 'FILE';
	var TEXT_TYPE = 'TEXT';
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
		switch (type) {
			case FILE_TYPE:
				content = {
					type: FILE_TYPE,
					filename: filename,
					filesize: file.size,
					content: cont
				};
				break;
			case TEXT_TYPE:
				content = {
					type: TEXT_TYPE,
					content: cont
				};
				break;
		}

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
	 * 文件检测函数
	 **/
	function isFileExist() {
		return $("#file-upload").val() !== '';
	}



	/**
	 *  消息发送函数
	 **/
	function sendMessage() {
		var startPoint = 0,
			endPoint = file.file.size;
		var FINISHREAD = true;
		if ($("#file-upload").val() !== '') {
			/**
			 * 这里是用的一个闭包方法取消忙等待（to do）
			 **/
			fileRead(fileSplice(startPoint, endPoint, file.file));
		} else {
			socket.emit('message', message(TEXT_TYPE, $('#message-box input').val()));
		}

		$('#message-box input').val('');
		$('#file-upload').val('');

		fileReader.onprogress = function(event) {
			//console.log(event.lengthComputable, event.loaded, event.total);
		};

		fileReader.onerror = function() {
			console.log("something wrong, CODE: " + fileReader.error.code);
		};

		fileReader.onload = function() {
			// 每一个chunk load完发送进入load下一块chunk的过程
			socket.emit('message', message(FILE_TYPE, {
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
	function updateChatList(chatList) {
		var userlist = chatList.userlist;
		var dropdownBtnStr;
		if (userlist === undefined) return;
		var chatlistHtml = "";
		for (var i = 0; i < userlist.length; i++) {
			dropdownBtnStr = "<button id='dropdownBtn' type='button' class='dropdown-toggle' " +
				"data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
				"<span class='caret'></span></button>" +
				"<ul role='menu' class='dropdown-menu' aria-labelledby='dropdownBtn'>" +
				"<li role='presentaion' class='p2pChat'><a username=" + userlist[i].username +
				">和他单独聊天</a></li><li role='presentaion'><a>查看个人资料</a></li></ul>";
			chatlistHtml = chatlistHtml + "<tr><td class='dropdown' width='100px'><span>" +
				userlist[i].username + "</span>" + dropdownBtnStr + "</td></tr>";

		}
		$('#chat-list').html(chatlistHtml);
		$('.p2pChat a').each(function() {
			$(this).click(function() {
				var confirm = window.confirm('跳转到私聊房间？');
				if (confirm === true) {
					var p2pFromUsername = window.location.toString().split('username=')[1];
					var p2pToUsername = $(this).attr('username');
					var roomID = p2pFromUsername + '~' + p2pToUsername;
					socket.emit('message', packageMessage(
						'p2pChatReq',
						_source,
						_destination,
						_cookie, {
							roomID: roomID,
							p2pFromUsername: p2pFromUsername,
							p2pToUsername: p2pToUsername
						}
					));
					window.open('/p2pChat?username=' + p2pFromUsername + '&&roomID=' + roomID, '_blank');
				} else {
					return;
				}
			});
		});
	}

	function p2pChatReq(response) {
		var curUsername = window.location.toString().split('?username=')[1];
		var roomID = response.data.roomID;
		if (response.data.p2pToUser.username == curUsername) {
			alert(response.data.p2pFromUser.username + '想和你私聊，即将跳转到私聊房间');
			window.open('/p2pChat?username=' + curUsername + '&&roomID=' + roomID, '_blank');
		}
	}

	/*************************************** Event ********************************/

	socket.on('welcome', function(ip) {
		IP = ip;
		_source = {
			ip: IP,
			portaddr: '8888'
		};
		//主动获取chatList
		$(document).ready(function() {
			setUser();
			getChatList();
		});
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
			case 600:
				p2pChatReq(response);
				break;
		}
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
		if (isFileExist()) {
			sendMessage();
		} else {
			sendMessage();
		}
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

	// 改变input file
	$("#file-upload").change(function() {
		if ($('#file-upload').val() !== null) {
			file.name = ($("#file-upload")[0].files)[0].name;
			file.file = ($("#file-upload")[0].files)[0];
			file.size = file.file.size;
			//fileRead();
		} else {
			file = {
				name: '',
				file: '',
				size: 0
			};
		}
	});
})();