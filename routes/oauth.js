const express = require('express');
const request = require('request');
const router = express.Router();

/** GET issues page. */
router.get('/', function(req, res, next) {
  let code = req.query.code;
  let access_token;
  new Promise(function (resolve, reject) {
    let options = {
      method: 'POST',
      uri: `https://github.com/login/oauth/access_token?client_id=93c906b21452e92cb0a9&client_secret=8ccaadcc3c30032787b2513eaa40bcee0ab9f833&code=${code}`,
      headers: {'user-agent': 'node.js'}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });
  })
  .then(result => {
    access_token = getParmFromHash(result, 'access_token');

    return new Promise(function (resolve, reject) {
      let options = {
        method: 'GET',
        uri: `https://api.github.com/user`,
        headers: {
          'user-agent': 'node.js',
          'Authorization' : `token ${access_token}`
        }
      };
      request(options, function (err, res, body) {
        if(err) reject(err);
        resolve(body);
      });

    })
  })
  .then(result => {
    console.log('API V3 RESULT:');
    console.log(result);
    result = JSON.parse(result);

    if(!('login' in result)){
      res.send("Authorization Error");
      return;
    }
    let user = {
      id: result.id,
      name: result.name,
      email: result.email,
      login: result.login,
      avatar_url: result.avatar_url,
      profile_url: result.html_url,
      repos_url: result.repos_url,
      access_token: access_token
    };
    req.session.user = user;

    /** return to home request*/
    res.redirect('/');

    // let reqBody = JSON.stringify({body: 'New V3 test!!'});
    // console.log(reqBody);
    // return new Promise(function (resolve, reject) {
    //   let options = {
    //     method: 'POST',
    //     uri: `https://api.github.com/repos/ark9606/unicorn_trip/issues/1/comments`,
    //     // uri: `https://api.github.com/repos/facebook/react/issues/1/comments`,
    //     headers: {
    //       'user-agent': 'node.js',
    //       'Authorization' : `token ${access_token}`
    //     },
    //     body: reqBody
    //   };
    //   request(options, function (err, res, body) {
    //     if(err) reject(err);
    //     resolve(body);
    //   });
    //
    // })
  })
  // .then(user=>{
  //   console.log('API V3 RESULT:');
  //   console.log(user);
  //   res.send(user);
  // })
  .catch(err=>{
    console.log(err);
  })

});

function getParmFromHash(url, parm) {
  let re = new RegExp(parm + "=([^&]+)(&|$)");
  let match = url.match(re);
  return (match ? match[1] : "");
}
module.exports = router;
