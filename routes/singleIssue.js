const express = require('express');
const git = require('../models/gitRequest');
const router = express.Router();


/** GET single issue page. */
router.get('/:owner/:repo/:number', function(req, res, next) {
  let number = parseInt(req.params.number);
  let repoOwner = req.params.owner;
  let repoName = req.params.repo;
  let pageCommentsCount = 0;
  let relevants = [];
  let isRelevants = false;

  /** ID of the last seen comment by this user */
  let lastCommentId = 0;

  let issue;
  if(isNaN(number)){
    res.render('error', {message: 'Something bad happened', error:{status: 'Error: no such issue'}});
    return;
  }

  git.getIssue(repoOwner, repoName, number)
  .then(result => {
    result = JSON.parse(result);
    if('message' in result){
      res.render('error', {message: 'Something bad happened', error:{status: 'No such issue'}});
      return;
    }
    // result.body = git.parseMarkdown(result.body, `${repoOwner}/${repoName}`);
    git.parseMarkdown(result.body, `${repoOwner}/${repoName}`)
    .then(html => {
      result.body = html;
    });

    result.gitLink = `https://github.com/${repoOwner}/${repoName}/issues/${number}`;
    issue = result;
    // return git.getCommentsForIssue(repoOwner, repoName, number, pageCommentsCount);
    return git.getRelevantsForIssue(repoOwner, repoName, number)
  })
  .then(result => {
    relevants = JSON.parse(result).filter(item=> item.event === 'cross-referenced').map(rel=>{
      let relObject;
      if(rel.source.type === 'issue')
        relObject = rel.source.issue;
      else
        relObject = rel.source.pull;

      return {
        type : rel.source.type,
        state: relObject.state,
        title: relObject.title,
        html_url: relObject.html_url,
        dateTimeStr: new Date(rel.created_at).toLocaleString(),
        dateTimeVal: new Date(rel.created_at),
        isOpen: relObject.state === 'open'
      }

    });
    isRelevants = relevants.length > 0;
    return git.getCommentsForIssue(repoOwner, repoName, number, pageCommentsCount);
  })
  .then(result => {
    let comments = JSON.parse(result);
    // console.log(comments);
    /** save owner repo number */
    req.session.issue = {
      repoOwner, repoName, number
    };

    // /** parse markdown for comments */
    // comments = comments.map(e=>{
    //   e.body = git.parseMarkdown(e.body, `${repoOwner}/${repoName}`);
    //   return e;
    // });

    /** parse markdown for comments */
    let promiseArray = [];
    comments = comments.forEach(e=>{
      promiseArray.push(
        new Promise((resolve)=> {
          git.parseMarkdown(e.body, `${repoOwner}/${repoName}`)
          .then(html=>{e.body = html; resolve(e)})
        })
      );
    });
    Promise.all(promiseArray)
    .then(newComments=>{
      let realUser = {
        login: '',
        url: '',
        avatar: '',
      };
      if(newComments.length> 0)
        lastCommentId = newComments[newComments.length-1].id;

      req.session.lastCommentId = lastCommentId;

      if(req.session.user !== undefined){
        realUser = {
          login: req.session.user.login,
          url: req.session.user.html_url,
          avatar: req.session.user.avatar_url
        }
      }

      res.render('singleIssue', {
        realUser: realUser,
        repoOwner,
        repoName,
        isLogged : !!req.session.user,
        issue: issue,
        comments: newComments,
        isRelevants,
        relevants,
        helpers: {
          generateUrlForLabel: function(name) {
            return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repoOwner}/${repoName}&page=1`
          },
          parseDate(date){
            return new Date(date).toLocaleString();
          },
          parseDateVal(date){
            return new Date(date);
          },
        }
      });
    })


    // let realUser = {
    //   login: '',
    //   url: '',
    //   avatar: '',
    // };
    // if(comments.length> 0)
    //   lastCommentId = comments[comments.length-1].id;
    //
    // req.session.lastCommentId = lastCommentId;
    //
    // if(req.session.user !== undefined){
    //   realUser = {
    //     login: req.session.user.login,
    //     url: req.session.user.html_url,
    //     avatar: req.session.user.avatar_url
    //   }
    // }
    //
    // res.render('singleIssue', {
    //   realUser: realUser,
    //   repoOwner,
    //   repoName,
    //   isLogged : !!req.session.user,
    //   issue: issue,
    //   comments: comments,
    //   isRelevants,
    //   relevants,
    //   helpers: {
    //     generateUrlForLabel: function(name) {
    //       return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repoOwner}/${repoName}&page=1`
    //     },
    //     parseDate(date){
    //       return new Date(date).toLocaleString();
    //     },
    //     parseDateVal(date){
    //       return new Date(date);
    //     },
    //   }
    // });

  })
  .catch(err => {
    console.log(err);
    res.render('error', {message: 'Something bad happened', error:{status: 'Try again later'}});
  });

});


module.exports = router;
