var express = require('express');
var router = express.Router();

//文件上传目录
router.get('/', function(req, res) {  
  res.render('upload', {
    title: '上传'
  });
});

module.exports = router;