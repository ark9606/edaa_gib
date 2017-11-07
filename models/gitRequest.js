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

let parseMarkdown = function (text, repo) {

  /** parse bold text */
  text = text.replace(/\*\*(.*?)\*\*/gm, "<b>$1</b>");

  /** parse italic text */
  text = text.replace(/\_(.*?)\_/gm, "<i>$1</i>");

  // text = text.replace(/\({0}https:\/\/github.com\/(.*?)\s{1}/gm, function (str) {

  // text = text.replace(/https:\/\/github.com\/(.*?)\s{1}/gm, function (str) {
  //   let num = str.substr(str.lastIndexOf('/')+1);
  //   return `<a href='${str}' class='reference reference_issue' target='_blank'>#${num}</a>`;
  // });

  /** parse links with Images*/
  text = text.replace(/\!\[(.*?)\]\((.*?)\)/gm, "<a href='$2' class='link' target='_blank'><img src='$2' alt='$1'></a>");

  /** parse links */
  text = text.replace(/\[(.*?)\]\((.*?)\)/gm, "<a href='$2' class='link' target='_blank'>$1</a>");


  /** parse multiline code text */
  text = text.replace(/```(.*?)```/gm, "<span class='code'><xmp>$1</xmp></span>");
  text = text.replace(/``(.*?)``/gm, "<span class='code'><xmp>$1</xmp></span>");

  /** parse inline code text */
  text = text.replace(/`(.*?)`/gm, "<span class='code'><xmp>$1</xmp></span>");

  // H E A D E R S

  /** parse header-3 text */
  text = text.replace(/^\#\#\# (.*?)$/gm, "<span class='header header_3'>$1</span>");

  /** parse header-2 text */
  text = text.replace(/^\#\# (.*?)$/gm, "<span class='header header_2'>$1</span>");

  /** parse header-1 text */
  text = text.replace(/^\# (.*?)$/gm, "<span class='header header_1'>$1</span>");

  /** parse quote text */
  text = text.replace(/^\>(.*?)$/gm, "<span class='quote'>$1</span>");

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
  // text = text.replace(/^\@(.*?)$/gm, "<a href='https://github.com/$1' class='mention' target='_blank' style='color: greenyellow'>@$1</a>");
  text = text.replace(/\@(\S+)/gm, "<a href='https://github.com/$1' class='mention' target='_blank'>@$1</a>");


  /** parse reference to issue */
  text = text.replace(/\s\#(\d+)\S?/gm, " <a href='https://github.com/"+ repo +"/issues/$1' class='reference reference_issue' target='_blank'>#$1</a>");

  text = text.replace(/\s\G\H\-(\d+)\S?/gm, " <a href='https://github.com/"+ repo +"/issues/$1' class='reference reference_issue' target='_blank'>GH-$1</a>");



  // text = text.replace(/https:\/\/github.com\/(.*?)\s{1}/gm, " <a href='https://github.com/$1' class='reference reference_issue' target='_blank'>#$1</a>");
  // text = text.replace(/[^"]https?:\/\/(.*?)[^"]/gm, " <a href='https://$1' target='_blank'>https://$1</a>");

  // text = text.replace(/((https?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gm, "<a href='$1' target='_blank'>$1</a>");

  // text = text.replace(/[^(href=("|\'))]https?:\/\/\S+/gim, "<a href='$1' target='_blank'>$1</a>");


  // text = text.replace(/<\/?[^>]+>/g,' ').replace(/(https?:\/\/\S+)/gim, "<a href='$1' target='_blank'>$1</a>");

  // text=text.replace(/(?<=('|")) /gim,'').replace(/[^(href=("|\'))]https?:\/\/\S+/gim, "<a href='$1' target='_blank'>$1</a>");









  // text = text.replace(/https?\:\S+[^("|')](?=[\ ])/gim, "<a href='$&' target='_blank'>$&</a>");

  text=text.replace(/(?:('|"))\s+(?=https?)/gim,'\'').replace(/[^(href=("|\'))]https?:\/\/\S+/gim, "<a href='$&' target='_blank'>$&</a>");



  //[^\"]

  /** parse new lines text */
  text = text.replace(/\r\n/gm, '</br>');

  return text;
};

// let parseMarkdown = function (text, repo) {
//
//   /** parse links with Images*/
//   text = text.replace(/\!\[(.*?)\]\((.*?)\)/gm, "<a href='$2' class='link' target='_blank'>$1 <img src='$2' alt='$1'></a>");
//
//   /** parse links */
//   text = text.replace(/\[(.*?)\]\((.*?)\)/gm, "<a href='$2' class='link' target='_blank'>$1</a>");
//
//   /** parse bold text */
//   text = text.replace(/\*\*(.*?)\*\*/gm, "<b>$1</b>");
//
//   /** parse italic text */
//   text = text.replace(/\_(.*?)\_/gm, "<i>$1</i>");
//
//   // remove <i> from links
//   // text = text.replace(/<a>(.*?)<\/a>/gm, function (match) {
//   //   console.log(match);
//   //   return '-'+ match;
//   // });
//
//
//   /** parse multiline code text */
//   text = text.replace(/\`\`\`(.*?)\`\`\`/gm, "<span class='code' style='color: blue'>$1</span>");
//
//   /** parse inline code text */
//   text = text.replace(/\`(.*?)\`/gm, "<span class='code' style='color: blue'>$1</span>");
//
//   // H E A D E R S
//
//   /** parse header-3 text */
//   text = text.replace(/^\#\#\# (.*?)$/gm, "<span class='header header_3' style='color: red'>$1</span>");
//
//   /** parse header-2 text */
//   text = text.replace(/^\#\# (.*?)$/gm, "<span class='header header_2' style='color: red; font-size: 1.5em'>$1</span>");
//
//   /** parse header-1 text */
//   text = text.replace(/^\# (.*?)$/gm, "<span class='header header_1' style='color: red; font-size: 2em'>$1</span>");
//
//   /** parse quote text */
//   text = text.replace(/^\>(.*?)$/gm, "<span class='quote' style='color: green; text-decoration: underline'>$1</span>");
//
//   // L I S T S
//
//   /** check-lists */
//
//   /** parse unchecked lists */
//   text = text.replace(/^\- \[ \](.*?)$/gm, "<span class='list list_check' style='text-decoration: overline'>$1</span>");
//
//   /** parse checked lists */
//   text = text.replace(/^\- \[x\](.*?)$/gm, "<span class='list list_check checked' style='color: #ac60ec; text-decoration: overline'>$1</span>");
//
//   /** parse ordered lists */
//   text = text.replace(/^[\d]+\. (.*?)$/gm, "<span class='list list_ordered' style='text-decoration: underline'>$1</span>");
//
//   /** parse unordered lists */
//   text = text.replace(/^\- (.*?)$/gm, "<span class='list list_unordered' style='text-decoration: line-through'>$1</span>");
//
//   //  O T H E R S
//
//   /** parse direct mention to owners/users */
//   // text = text.replace(/^\@(.*?)$/gm, "<a href='https://github.com/$1' class='mention' target='_blank' style='color: greenyellow'>@$1</a>");
//   text = text.replace(/\@(\S+)/gm, "<a href='https://github.com/$1' class='mention' target='_blank' style='color: greenyellow'>@$1</a>");
//
//
//   /** parse reference to issue */
//   text = text.replace(/\s\#(\d+)\S?/gm, " <a href='https://github.com/"+ repo +"/issues/$1' class='reference reference_issue' target='_blank'>#$1</a>");
//
//   text = text.replace(/\s\G\H\-(\d+)\S?/gm, " <a href='https://github.com/"+ repo +"/issues/$1' class='reference reference_issue' target='_blank'>GH-$1</a>");
//
//   // text = text.replace(/^\#(\d+)\S?/gm, function () {
//   //   return "<a href='https://github.com/'+ repo +'/issues/$1' class='reference reference_issue' target='_blank'>#$1</a>"
//   // });
//
//   /** parse new lines text */
//   text = text.replace(/\r\n/gm, '</br>');
//
//
//
//   return text;
// };

/** requests */
exports.getLabelsForRepo = getLabelsForRepo;
exports.getIssuesForLabels = getIssuesForLabels;
exports.getIssue = getIssue;
exports.getCommentsForIssue = getCommentsForIssue;
exports.getNewCommentsForIssue = getNewCommentsForIssue;
exports.getCommentsForRepo = getCommentsForRepo;

/** functions */
exports.parseMarkdown = parseMarkdown;

/** vars */
exports.issuesPerPage = issuesPerPage;
exports.commentsPerPage = commentsPerPage;
exports.repoCommentsPerPage = repoCommentsPerPage;