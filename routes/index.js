const express = require('express');
const git = require('../models/gitRequest');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { isLogged : !!req.session.user });
});


router.post('/repo', function(req, res, next) {
  let repoOwner = req.body.repoOwner;
  let repoName = req.body.repoName;

  /** REQUEST LABELS FOR REPO */
  git.getLabelsForRepo(repoOwner, repoName)
  .then(result => {
    result = JSON.parse(result);
    if('message' in result){
      // res.render('error', {message: 'Something bad happened', error:{status: 'Try again later'}});
      res.send('%NO%');
      return;
    }

    /** GROUP LABELS */
    let labels = [];
    result.forEach(label => {
      /** detect nested labels */
      if(label.name.includes(':')){
        let labelParts = label.name.split(':');

        /** array already has this type of label */
        let group = labels.filter(item => item.name === labelParts[0]);
        if( group.length > 0){

          /** add label in existed group */
          label.isNested = false;
          label.fullName = label.name;
          label.name = labelParts[1].trim();
          group[0].items.push(label);
        }
        else {

          /** create new group */
          let newGroup = {name: labelParts[0], isNested: true, items : []};
          label.fullName = label.name;
          label.name = labelParts[1].trim();
          newGroup.items.push(label);
          labels.push(newGroup);
        }
      }
      else {

        /** simple label */
        label.isNested = false;
        labels.push(label);
      }
    });

    res.send(labels);
  })
  .catch(err => {
    res.send('%NO%');
    // res.render('error', {message: 'Something bad happened', error:{status: 'Try again later'}});
  });
});

router.post('/loadcomments', function(req, res, next) {
  let repoOwner = req.body.repoOwner;
  let repoName = req.body.repoName;
  let page = parseInt(req.body.page);

  git.getCommentsForRepo(`${repoOwner}/${repoName}`, page)
  .then(result=>{
    result = JSON.parse(result);

    /** parse markdown for comments */
    let promiseArray = [];
    let comments = result.forEach(e=>{
      promiseArray.push(
        new Promise((resolve)=> {
          git.parseMarkdown(e.body, `${repoOwner}/${repoName}`)
          .then(html=>{e.body = html; resolve(e)})
        })
      );
    });
    Promise.all(promiseArray)
    .then(newComments=>{
      res.send( {
        comments: newComments,
        isLoadMoreBtn: result.length === git.repoCommentsPerPage,
      });
    });

    // result = result.map(e=>{
    //   e.body = git.parseMarkdown(e.body, `${repoOwner}/${repoName}`);
    //   return e;
    // });

    // res.send( {
    //   comments: result,
    //   isLoadMoreBtn: result.length === git.repoCommentsPerPage,
    // });
  })
  .catch(err=>{
    console.log(err);
    res.send('%NO%');
  })
});

router.post('/login', function(req, res, next) {
  req.session.myRedirect_url = req.body.redirect_url;
  console.log('REDirect');
  console.log(req.session.myRedirect_url);
  res.send('%OK%');
});
module.exports = router;
