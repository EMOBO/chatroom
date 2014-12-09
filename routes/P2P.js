var express = require('express');
var router = express.Router();

//P2P聊天页面
router.get('/', function(req, res) {  
  res.render('P2P', {
    title: '私人聊天'
  });
});

module.exports = router;