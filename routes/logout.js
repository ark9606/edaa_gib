const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  if(req.session.user){
    req.session.user = undefined;
  }
  res.redirect('/');
});

module.exports = router;
