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

})();