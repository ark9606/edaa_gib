'use strict';

let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
let xhr = new XHR();

/** current page */
let page = parseInt(window.location.href.substr(window.location.href.indexOf('&page=') + 6));

if(document.getElementById('loadMore') !== null) {
  document.getElementById('loadMore').addEventListener('click', function (e) {
    page++;
    // query = `issues?q=${query}&page=${page}`;
    xhr.open('POST', 'issues/loadmore');
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(JSON.stringify({q: query, page: page}));

    xhr.onreadystatechange = (function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status !== 200) {
        alert('ERROR ' + xhr.status + ': ' + xhr.statusText);
      }
      else {
        let data = xhr.response;
        if (data.includes('%NO%')) {
          alert('There is some issue');
          console.log(xhr);
          return;
        }
        let issues = JSON.parse(data);
        console.log(issues);
        if (!issues.isLoadMoreBtn) {

          this.parentNode.removeChild(this);
        }

        showIssues(issues.issues);
      }
    }).bind(this);
  });
}
function showIssues(issues) {
  let container = document.getElementById('issue_container');
  let div = document.createElement('div');
  let html = '';
  issues.forEach(item => {
    html += `<div class="issue"><a href="${generateUrlForIssue(item.number)}"><pre>${item.title}</pre></a><div class="issue_labels">`;
    item.labels.forEach(l => {
      html+=`<a href="${generateUrlForLabel(l.name)}">${l.name}</a>`;
    });
    html +='</div></div>';
  });
  div.innerHTML = html;
  while (div.firstChild){
    container.appendChild(div.firstChild)
  }
}

function generateUrlForLabel(name) {
  return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repo}&page=1`
}
function generateUrlForIssue(number) {
  return `/issue/${repo}/${number}`;
}