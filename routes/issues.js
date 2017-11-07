const express = require('express');
const git = require('../models/gitRequest');
const router = express.Router();

/** GET issues page. */

router.get('/', function(req, res, next) {
  let currentPage = parseInt(req.query.page);
  if(isNaN(currentPage)){
    res.render('error', {message: 'Something bad happened', error:{status: 'Error: no such page'}});
    return;
  }
  let query = req.query.q.substr(0, req.query.q.indexOf('repo:'));
  let repo = req.query.q.substr(req.query.q.indexOf('repo:') + 5);

  let selectedLabels = query.replace('label:','').split('label:').map(e=>e.replace(/"/g, '').trim());

  // save for next easy checking
  let simpleSelectedLabels = Array.from(selectedLabels);
  git.getIssuesForLabels(req.query.q, currentPage)
  .then(result => {
    result = JSON.parse(result);
    
    // result.items = result.items.map(e =>{
    //   e.labels = e.labels.filter(l => !selectedLabels.includes(l.name) );
    //   return e;
    // });
    result.items = result.items.map(e =>{
      e.labels = e.labels.filter(l => {

        // get colors for labels
        if(selectedLabels.includes(l.name)){
          selectedLabels[selectedLabels.indexOf(l.name)] = {
            name: l.name,
            color: l.color
          }
        }
        return (!simpleSelectedLabels.includes(l.name));
      });
      // e.created_at = new Date(e.created_at).toLocaleString();
      return e;
    });
    console.log(result);
    res.render('issues', {
      isLogged : !!req.session.user,

      labels: selectedLabels,
      islabelsSelected: query.length > 0,

      total_count: result.total_count,
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
  .catch(err => {
    console.log(err);
    // res.send('Error');
    res.render('error', {message: 'Something bad happened', error:{status: 'Try again later'}});

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
    // res.send('%NO%');
    res.render('error', {message: 'Something bad happened', error:{status: 'Try again later'}});

  });

});




module.exports = router;
