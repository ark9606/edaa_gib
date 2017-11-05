const express = require('express');
const git = require('../models/gitRequest');
const router = express.Router();

/** GET issues page. */

router.get('/', function(req, res, next) {
  let currentPage = parseInt(req.query.page);
  if(isNaN(currentPage)){
    res.send('Error: no such page');
    return;
  }
  let query = req.query.q.substr(0, req.query.q.indexOf('repo:'));
  let repo = req.query.q.substr(req.query.q.indexOf('repo:') + 5);

  let selectedLabels = query.replace('label:','').split('label:').map(e=>e.replace(/"/g, '').trim());
  // console.log('selectedLabels');
  // console.log(selectedLabels);
  git.getIssuesForLabels(req.query.q, currentPage)
  .then(result => {
    result = JSON.parse(result);
    
    result.items = result.items.map(e =>{
      e.labels = e.labels.filter(l => !selectedLabels.includes(l.name) );
      return e;
    });
    res.render('issues', {
      isLogged : !!req.session.user,

      labels: selectedLabels,
      islabelsSelected: query.length > 0,

      issues: result.items,
      noIssues: result.total_count === 0,

      isLoadMoreBtn: result.items.length === git.issuesPerPage,
      query: req.query.q,
      repo: repo,
      helpers: {
        generateUrlForLabel: function(name) {
          // name = name.includes(':')? `"${name}"`: name;
          return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repo}&page=1`
        },
        generateUrlForIssue: function(number) {
          return `/issue/${repo}/${number}`;
        }
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.send('Error');
  });

});

/** GET new issues */
router.post('/loadmore', function(req, res, next) {

  let query = req.body.q.substr(0, req.body.q.indexOf('repo:'));
  let selectedLabels = query.replace('label:','').split('label:').map(e=>e.replace(/"/g, '').trim());

  git.getIssuesForLabels(req.body.q, parseInt( req.body.page))
  .then(result => {
    result = JSON.parse(result);
    result.items = result.items.map(e =>{
      e.labels = e.labels.filter(l => !selectedLabels.includes(l.name) );
      return e;
    });

    res.send( {
      issues: result.items,
      isLoadMoreBtn: result.items.length === git.issuesPerPage,
    });

  })
  .catch(err => {
    console.log(err);
    res.send('%NO%');
  });

});




module.exports = router;
