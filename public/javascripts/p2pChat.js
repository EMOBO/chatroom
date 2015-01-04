(function() {
  /*********************************** variable ******************************/
  var TEXT_TYPE = 'TEXT';
  var FILE_TYPE = 'FILE';
  var _source;
  var _destination;
  var _cookie = 'cookie null';
  var socket = io();

  /************************************ function ********************************/
  function message(type, cont, filename) {
    var content;
    var username = decodeURIComponent(window.location.toString().split('?username=')[1].split('&&')[0]);
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
      'p2pChat',
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
    $('#p2pChat-dynamic').empty();
  }

  /**
   *  消息发送函数
   **/
  function sendMessage() {
    socket.emit('p2pMessage', message(TEXT_TYPE, $('#p2pMessage-box input').val()));
    $('#p2pMessage-box input').val('');
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
    $('#p2pChat-dynamic').append(element);
    $('#file-' + message.content.hashCode + '-bar').css('width', $('#file-' + message.content.hashCode + '-box>p').css('width'));
    var scrollHeight = $('#p2pChat-dynamic').height() + 2 * $('#p2pChat-box-header').height() - $('#p2pChat-box').height();
    $('#p2pChat-box').scrollTop(scrollHeight);
  }

  function updateMessageBox_Text(message) {
    $('#p2pChat-dynamic').append('<p><b>(' + message.time + ') ' + message.username + ' : ' + message.content.content + '</b></p>');
    var scrollHeight = $('#p2pChat-dynamic').height() + 2 * $('#p2pChat-box-header').height() - $('#p2pChat-box').height();
    $('#p2pChat-box').scrollTop(scrollHeight);
  }

  function setUpWelcomeInfo(welcomeInfo) {
    var curUsername = decodeURIComponent(location.toString().split('?username=')[1].split('&&')).split(',')[0];
    var hisName;
    if (curUsername == welcomeInfo.p2pFromUser.username) {
      hisName = welcomeInfo.p2pToUser.username;
      _source = {
        ip: welcomeInfo.p2pFromUser.ip,
        portaddr: welcomeInfo.p2pFromUser.port
      };
      _destination = {
        ip: welcomeInfo.p2pToUser.ip,
        portaddr: welcomeInfo.p2pToUser.port
      };
    } else {
      hisName = welcomeInfo.p2pFromUser.username;
      _source = {
        ip: welcomeInfo.p2pToUser.ip,
        portaddr: welcomeInfo.p2pToUser.port
      };
      _destination = {
        ip: welcomeInfo.p2pFromUser.ip,
        portaddr: welcomeInfo.p2pFromUser.port
      };
    }

    var p2pUsername = "<tr><td width='100px'><span>" + hisName + "</span></td></tr>";
    $('#p2p-list').html(p2pUsername);
  }

  /*************************************** Event ********************************/

  socket.on('p2pWelcome', function(welcomeInfo) {
    setUpWelcomeInfo(welcomeInfo);
  });

  socket.on('p2pMessage', function(p2pMessage) {
    updateMessageBox(p2pMessage.data);
  });

  socket.on('p2pDisconnect', function(disconnectMsg) {
    $('#p2p-list').html('');
    alert(disconnectMsg.message);
  });

  //按下Enter
  $('#p2pMessage-box input').keydown(function(e) {
    if (e.keyCode === 13) {
      $('#p2p-send-message').click();
    }
  });

  //点击发送按钮
  $('#p2p-send-message').click(function() {
    sendMessage();
  });

  //点击返回按钮
  $('#go-back').click(function() {
    alert('即将退出私聊房间');
  });

  //按下Esc
  $('body').keydown(function(e) {
    if (e.keyCode === 27) {
      $('#p2p-clean-box').click();
    }
  });

  //点击清屏按钮
  $('#p2p-clean-box').on('click', cleanScreen);
})();