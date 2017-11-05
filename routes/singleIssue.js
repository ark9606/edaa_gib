const express = require('express');
const git = require('../models/gitRequest');
const router = express.Router();


/** GET single issue page. */
router.get('/:owner/:repo/:number', function(req, res, next) {
  let number = parseInt(req.params.number);
  let repoOwner = req.params.owner;
  let repoName = req.params.repo;
  let pageCommentsCount = 0;

  let issue;
  if(isNaN(number)){
    res.send('Error: no such issue');
    return;
  }

  git.getIssue(repoOwner, repoName, number)
  .then(result => {
    result = JSON.parse(result);
    if('message' in result){
      res.send('Error: no such issue');
      return;
    }
    result.body = git.parseMarkdown(result.body, `${repoOwner}/${repoName}`);
    result.gitLink = `https://github.com/${repoOwner}/${repoName}/issues/${number}`;
    issue = result;
    // totalCommentsCount = issue.comments;
    // console.log('totalCommentsCount');
    // console.log(totalCommentsCount);
    //
    // /** how many comments pages */
    //
    // let lastPageCommentsCount = totalCommentsCount % git.commentsPerPage;
    // pageCommentsCount = parseInt(totalCommentsCount / git.commentsPerPage);
    // if(lastPageCommentsCount> 0)
    //   pageCommentsCount++;

    return git.getCommentsForIssue(repoOwner, repoName, number, pageCommentsCount);
  })
  .then(result => {
    let comments = JSON.parse(result);
    // console.log(comments);
    /** save owner repo number */
    req.session.issue = {
      repoOwner, repoName, number
    };

    /** parse markdown for comments */
    comments = comments.map(e=>{
      e.body = git.parseMarkdown(e.body, `${repoOwner}/${repoName}`);
      return e;
    });

    res.render('singleIssue', {
      isLogged : !!req.session.user,
      issue: issue,
      comments: comments,
      isLabelled: !(issue.labels.length === 0),
      helpers: {
        generateUrlForLabel: function(name) {
          return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repoOwner}/${repoName}&page=1`
        }
      }
    });

  })
  .catch(err => {
    console.log(err);
    res.send('Error');
  });

});


module.exports = router;
