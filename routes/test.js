const express = require('express');
const router = express.Router();
const git = require('../models/gitRequest');

/* GET home page. */
router.get('/', function(req, res, next) {
  git.getRelevantsForIssue('facebook','react',11306)
  .then(result=>{
    result = JSON.parse(result);
    // console.dir(result);

    let crossReferencedEvents = result.filter(item=> item.event === 'cross-referenced');
    console.log(crossReferencedEvents);

    res.send(crossReferencedEvents);
  })
  .catch(err=>{
    console.log(err);
    res.send(err);
  });

});

module.exports = router;
