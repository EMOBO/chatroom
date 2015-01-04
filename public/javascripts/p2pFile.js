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
  var isFileReaderFinish = true;
  /************************************ function ********************************/
  function filePackage(type, cont, filename) {
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
  function sendFile() {
    var startPoint = 0,
      endPoint = file.file.size;
    var FINISHREAD = true;
    fileRead(fileSplice(startPoint, endPoint, file.file));

    $('#p2p-file-upload').val('');

    fileReader.onprogress = function(event) {
      //console.log(event.lengthComputable, event.loaded, event.total);
    };

    fileReader.onerror = function() {
      console.log("something wrong, CODE: " + fileReader.error.code);
    };

    fileReader.onload = function() {
      // 每一个chunk load完发送进入load下一块chunk的过程

      socket.emit('p2pMessage', filePackage(FILE_TYPE, {
        data: fileReader.result,
        Final: startPoint + FILE_LIMITSIZE >= endPoint ? true : false
      }, file.name));
      FINISHREAD = true;
      startPoint += FILE_LIMITSIZE;
      if (startPoint + FILE_LIMITSIZE >= endPoint) {
        isFileReaderFinish = true;
      }
      console.log(isFileReaderFinish);
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
  $('#p2p-send-file').click(function() {
    console.log($('#p2p-file-upload').file);
    if ($('#p2p-file-upload').val() !== '') {
      if (isFileReaderFinish) {
        isFileReaderFinish = false;
        file.name = ($("#p2p-file-upload")[0].files)[0].name;
        file.file = ($("#p2p-file-upload")[0].files)[0];
        file.size = file.file.size;
        sendFile();
      } else {
        alert("文件 " + file.name + " 正在传输，请稍等.");
      }
    } else {
      alert('请先选择文件');
    }
  });
})();