const request = require('request');
const issuesPerPage = 10;
// const commentsPerPage = 10;
const commentsPerPage = 150;
const repoCommentsPerPage = 10;

// const PERSONAL_ACCESS_TOKEN = 'ad41cd3dfea94ca4cf40431cf239f2abb2421834';
const PERSONAL_ACCESS_TOKEN = 'e4268721eca0e5253b0e9e5713df6f195e4299f4';

let getLabelsForRepo = function (repoOwner, repoName) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      // uri: `https://api.github.com/repos/${repoOwner}/${repoName}/labels?page=1&per_page=15`,
      uri: `https://api.github.com/repos/${repoOwner}/${repoName}/labels?per_page=100`,
      headers: {
        'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`
      }
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });

  });
};

let getIssuesForLabels = function (query, page=1) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      // api.github.com/search/issues?q=label:HTML+label:"Type:%20Bug"+state:open+repo:facebook/react&page=1&per_page=10
      uri: `https://api.github.com/search/issues?q=${query}+state:open&page=${page}&per_page=${issuesPerPage}`,
      headers: {'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });

  });
};
let getIssue = function (owner, repo, number) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      // https://api.github.com/repos/facebook/react/issues/11092
      uri: `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
      headers: {'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });
  });
};

let getCommentsForRepo = function (repo, page=1) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      uri: `https://api.github.com/repos/${repo}/issues/comments?page=${page}&per_page=${repoCommentsPerPage}&sort=created&direction=desc`,
      headers: {'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });
  });
};

let getCommentsForIssue = function (owner, repo, number, page=1) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      uri: `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?page=${page}&per_page=${commentsPerPage}`,
      headers: {'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });
  });
};

let getNewCommentsForIssue = function (owner, repo, number, lastCommentId) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      uri: `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?page=1&per_page=${commentsPerPage+10}`,
      headers: {'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`}
    };
    request(options, function (err, res, body) {
      if(err) reject(err);

      let comments = JSON.parse(body).filter(item=>item.id > lastCommentId);
      resolve(comments);
    });
  });
};

/**
 * text: markdown text
 * repo: associated repo
 * type: 0 - our parsing (beta v0.1)
 *       1 - GitHub parsing
 * */
let parseMarkdown = function (text, repo, type = 1) {
  return new Promise(function (resolve) {
    if( type === 0) {

      /** parse bold text */
      text = text.replace(/\*\*(.*?)\*\*/gm, "<strong>$1</strong>");

      /** parse italic text */
      text = text.replace(/\_(.*?)\_/gm, "<em>$1</em>");

      /** parse links with Images*/
      text = text.replace(/\!\[(.*?)\]\((.*?)\)/gm, "<a href='$2' target='_blank'><img src='$2' alt='$1'></a>");

      /** parse links */
      text = text.replace(/\[(.*?)\]\((.*?)\)/gm, "<a href='$2' target='_blank'>$1</a>");


      /** parse multiline code text */
      text = text.replace(/```(.*?)```/gm, "<code>$1</code>");
      text = text.replace(/``(.*?)``/gm, "<code>$1</code>");

      /** parse inline code text */
      text = text.replace(/`(.*?)`/gm, "<code>$1</code>");

      // H E A D E R S

      /** parse header-3 text */
      text = text.replace(/^\#\#\# (.*?)$/gm, "<h3'>$1</h3>");

      /** parse header-2 text */
      text = text.replace(/^\#\# (.*?)$/gm, "<h2>$1</h2>");

      /** parse header-1 text */
      text = text.replace(/^\# (.*?)$/gm, "<h1>$1</h1>");

      /** parse quote text */
      text = text.replace(/^\>(.*?)$/gm, "<blockquote>$1</blockquote>");

      // L I S T S

      /** check-lists */

      /** parse unchecked lists */
      text = text.replace(/^\- \[ \](.*?)$/gm, "<span class='list list_check'>$1</span>");

      /** parse checked lists */
      text = text.replace(/^\- \[x\](.*?)$/gm, "<span class='list list_check checked'>$1</span>");

      /** parse ordered lists */
      text = text.replace(/^([\d]+\. .*?)$/gm, "<span class='list list_ordered'>$1</span>");

      /** parse unordered lists */
      text = text.replace(/^\- (.*?)$/gm, "<span class='list list_unordered'>$1</span>");

      //  O T H E R S

      /** parse direct mention to owners/users */
      text = text.replace(/\@(\S+)/gm, "<a href='https://github.com/$1' class='user-mention' target='_blank'>@$1</a>");


      /** parse reference to issue */
      text = text.replace(/\s\#(\d+)\S?/gm, " <a href='https://github.com/" + repo + "/issues/$1' class='issue-link' target='_blank'>#$1</a>");

      text = text.replace(/\s\G\H\-(\d+)\S?/gm, " <a href='https://github.com/" + repo + "/issues/$1' class='issue-link' target='_blank'>GH-$1</a>");

      /** make pure links clickable */
      text = text.replace(/(?:('|"))\s+(?=https?)/gim, '\'').replace(/[^(href=("|\'))]https?:\/\/\S+/gim, "<a href='$&' target='_blank'>$&</a>");


      /** parse new lines text */
      text = text.replace(/\r\n/gm, '</br>');


      resolve(text);
    }
    else {
      let options = {
        method: 'POST',
        uri: `https://api.github.com/markdown`,
        headers: {
          'user-agent': 'node.js',
          'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          text,
          mode: 'gfm',
          context: repo
        })
      };
      request(options, function (err, res, body) {
        if(err) {
          console.log(err);
          parseMarkdown(text, repo, 0);
        }
        if(body.includes('"message": "You have triggered an abuse')){
          parseMarkdown(text, repo, 0);
        }
        else
          resolve(body);

      });
    }
  });
};




let getRelevantsForIssue = function (owner, repo, number) {
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'GET',
      uri: `https://api.github.com/repos/${owner}/${repo}/issues/${number}/timeline`,
      headers: {
        'user-agent': 'node.js',
        'Authorization' : `token ${PERSONAL_ACCESS_TOKEN}`,
        'Accept': 'application/vnd.github.mockingbird-preview'
      }
    };
    request(options, function (err, res, body) {
      if(err) reject(err);
      resolve(body);
    });
  });
};

/** requests */
exports.getLabelsForRepo = getLabelsForRepo;
exports.getIssuesForLabels = getIssuesForLabels;
exports.getIssue = getIssue;
exports.getCommentsForIssue = getCommentsForIssue;
exports.getNewCommentsForIssue = getNewCommentsForIssue;
exports.getCommentsForRepo = getCommentsForRepo;
exports.getRelevantsForIssue = getRelevantsForIssue;

/** functions */
exports.parseMarkdown = parseMarkdown;

/** vars */
exports.issuesPerPage = issuesPerPage;
exports.commentsPerPage = commentsPerPage;
exports.repoCommentsPerPage = repoCommentsPerPage;