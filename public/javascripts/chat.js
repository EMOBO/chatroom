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
	var socket = io();

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

		if (hour >= 12) {
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
				if ($('#file-' + message.content.hashCode + '-bar>.progress-bar').css('width') === undefined)
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
			$('#file-' + message.content.hashCode + '-bar>.progress-bar').css('width', message.content.percentage + '%');
			$('#file-' + message.content.hashCode + '-bar>.progress-bar').text(message.content.percentage + '%');
		} else {
			$('#file-' + message.content.hashCode + '-bar>.progress-bar').css('width', '100%');
			$('#file-' + message.content.hashCode + '-bar>.progress-bar').text('100%');
			setTimeout(function() {
				console.log(message.content.fileType);
				switch (message.content.fileType) {
					case 'img':
						updateMessageBox_Image(message);
						break;
					case 'video':
						updateMessageBox_video(message);
						break;
					case 'normal':
						updateMessageBox_OrdinaryFile(message);
						break;
				}
				$('#file-' + message.content.hashCode + '-bar').remove();
			}, 1000);
		}

		function updateMessageBox_Image(message) {
			$('#file-' + message.content.hashCode + '-box>p').html(
				$('#file-' + message.content.hashCode + '-box>p').html()
				.split(message.content.filename).join("图:"));
			$('#file-' + message.content.hashCode + '-box>p>a').attr('href', message.address);
			$('#file-' + message.content.hashCode + '-box>p>a>img')
				.attr('src', message.content.filename)
				.addClass('receiveImage');
			console.log($('#file-' + message.content.hashCode + '-box>p>a>img').css('width'), $('#file-' + message.content.hashCode + '-box>p>a>img').css('height'));
			$('#file-' + message.content.hashCode + '-box>p').css('background-color', '#9DFFB0');
		}

		function updateMessageBox_video(message) {
			updateMessageBox_OrdinaryFile(message);
		}

		function updateMessageBox_OrdinaryFile(message) {
			$('#file-' + message.content.hashCode + '-box>p>a').attr('href', message.address);
			$('#file-' + message.content.hashCode + '-box>p>a>img').attr('src', 'img/filedone.png');
			$('#file-' + message.content.hashCode + '-box>p').css('background-color', '#9DFFB0');
		}
	}

	function createFileMessageBox(message) {
		var element = '<div class="fileBox" id="file-' + message.content.hashCode + '-box"><p><b>(' + message.time + ') ' + message.username +
			' : ' + message.content.filename +
			'</b><a target="_blank"><img src = "img/loading.gif"></img></a></p><div id="file-' +
			message.content.hashCode +
			'-bar" class="progress"><div class="progress-bar" role="progressbar"' +
			' aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%' +
			'</div></div></div>';
		$('#chat-dynamic').append(element);
		$('#file-' + message.content.hashCode + '-bar').css('width', $('#file-' + message.content.hashCode + '-box>p').css('width'));
		var scrollHeight = $('#chat-dynamic').height() + 2 * $('#chat-box-header').height() - $('#chat-box').height();
		$('#chat-box').scrollTop(scrollHeight);
	}

	function updateMessageBox_Text(message) {
		$('#chat-dynamic').append('<p><b>(' + message.time + ') ' + message.username + ' : ' + message.content.content + '</b></p>');
		var scrollHeight = $('#chat-dynamic').height() + 2 * $('#chat-box-header').height() - $('#chat-box').height();
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

		$('#online-list-counter').text(chatList.size);
		for (var i = 0; i < userlist.length; i++) {
			dropdownBtnStr = "<button id='dropdownBtn' type='button' class='dropdown-toggle' " +
				"data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
				"<span class='caret'></span></button>" +
				"<ul role='menu' class='dropdown-menu' aria-labelledby='dropdownBtn'>" +
				"<li role='presentaion' class='p2pChat'><a username=" + userlist[i].username +
				">和他单独聊天</a></li></ul>";
			chatlistHtml = chatlistHtml + "<tr><td class='dropdown' width='100px'><span>" +
				userlist[i].username + "</span>" + dropdownBtnStr + "</td></tr>";

		}
		$('#chat-list').html(chatlistHtml);
		$('.p2pChat a').each(function() {
			$(this).click(function() {
				var confirm = window.confirm('跳转到私聊房间？');
				if (confirm === true) {
					var p2pFromUsername = decodeURIComponent(window.location.toString().split('?username=')).split(',')[1];
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
					var p2pURL = '/p2pChat?username=' + p2pFromUsername + '&&roomID=' + roomID; 
					window.open(p2pURL, '_blank');
				} else {
					return;
				}
			});
		});
	}

	function p2pChatReq(response) {
		var curUsername = decodeURIComponent(window.location.toString().split('?username=')).split(',')[1];
		var roomID = response.data.roomID;
		if (response.data.p2pToUser.username == curUsername) {
			alert(response.data.p2pFromUser.username + '想和你私聊，即将跳转到私聊房间');
			var p2pURL = '/p2pChat?username=' + curUsername + '&&roomID=' + roomID;
			window.open(p2pURL, '_blank');
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

})();