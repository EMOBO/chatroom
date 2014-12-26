(function() {
  (function() {
    /*********************************** variable ******************************/
    var FILE_TYPE = 'FILE';
    var TEXT_TYPE = 'TEXT';
    var FILE_LIMITSIZE = 5120000;
    var file = {
      name: '',
      file: '',
      size: 0
    };
    var socket = io();
    var _source;
    var _destination;
    var _cookie = 'cookie null';
    var fileReader = new FileReader();

    /************************************ function ********************************/
    function message(type, cont, filename) {
      var content;
      var username = window.location.toString().split('&&')[0].split('?username=')[1];
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
     * 文件检测函数
     **/
    function isFileExist() {
      return $("#p2p-file-upload").val() !== '';
    }

    /**
     *  消息发送函数
     **/
    function sendMessage() {
      var startPoint = 0,
        endPoint = file.size;
      var FINISHREAD = true;
      if ($("#p2p-file-upload").val() !== '') {
        /**
         * 这里是用的一个闭包方法取消忙等待
         **/
        fileRead(fileSplice(startPoint, endPoint, file.file));
      } else {
        socket.emit('p2pMessage', message(TEXT_TYPE, $('#p2pMessage-box input').val()));
      }

      $('#p2pMessage-box input').val('');
      $('#p2p-file-upload').val('');

      fileReader.onprogress = function(event) {
        console.log(event.lengthComputable, event.loaded, event.total);
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
        return fileRead(fileSplice(startPoint, endPoint, file.file));

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
    function updateMessageBox(p2pMessage) {
      switch (message.content.type) {
        case FILE_TYPE:
          updateMessageBox_File(p2pMessage);
          break;
        case TEXT_TYPE:
          updateMessageBox_Text(p2pMessage);
          break;
      }
    }

    function updateMessageBox_File(p2pMessage) {
      $('#p2pChat-dynamic').append('<p><b>(' + p2pMessage.time + ') ' + p2pMessage.username +
        ' : </b>' + p2pMessage.content.filename +
        '<a target="_blank" href=' + p2pMessage.address + '>' + ' 下载 </a>' + '</p>');
      var scrollHeight = $('#p2pChat-dynamic').height() - $('#p2pChat-box').height();
      $('#p2pChat-box').scrollTop(scrollHeight);
    }

    function updateMessageBox_Text(p2pMessage) {
      $('#p2pChat-dynamic').append('<p><b>(' + p2pMessage.data.time + ') ' + p2pMessage.data.username + ' : </b>' + p2pMessage.data.content.content + '</p>');
      var scrollHeight = $('#p2pChat-dynamic').height() - $('#p2pChat-box').height();
      $('#p2pChat-box').scrollTop(scrollHeight);
    }

    function setUpWelcomeInfo(welcomeInfo) {
      var curUsername = window.location.toString().split('?username=')[1].split('&&')[0];
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
      console.log('收到的p2p消息为：');
      console.log(p2pMessage);
      updateMessageBox_Text(p2pMessage);
    });

    socket.on('p2pDisconnect', function(disconnectMsg) {
      $('#p2p-list').html('');
      alert(disconnectMsg.message);
    });

    /**
     *  发送消息
     **/
    //按下Enter
    $('#p2pMessage-box input').keydown(function(e) {
      if (e.keyCode === 13) {
        $('#p2p-send-message').click();
      }
    });
    //点击发送按钮
    $('#p2p-send-message').click(function() {
      if (isFileExist()) {
        //console.log($("#p2p-file-upload")[0].files);
        //fileRead();
        sendMessage();
      } else {
        sendMessage();
      }
    });
    //点击返回按钮
    $('#go-back').click(function() {
      alert('即将退出聊天室');
    });
    // 改变input file
    $("#p2p-file-upload").change(function() {
      if ($('#p2p-file-upload').val() !== null) {
        file.name = ($("#p2p-file-upload")[0].files)[0].name;
        file.file = ($("#p2p-file-upload")[0].files)[0];
        file.size = file.file.size;
        console.log(file);
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
})();