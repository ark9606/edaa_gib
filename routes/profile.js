const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.user === undefined){
    res.redirect('/');
    return;
  }

  let user = {};
  Object.assign(user, req.session.user);
  user.access_token = null;
  console.log(req.session.user);
  res.render('profile', {
    isLogged : !!req.session.user,
    user: user
  });
});

module.exports = router;
