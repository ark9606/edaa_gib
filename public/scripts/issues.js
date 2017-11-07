'use strict';

let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
let xhr = new XHR();

/** current page */
let page = parseInt(window.location.href.substr(window.location.href.indexOf('&page=') + 6));

if(document.getElementById('loadMore') !== null) {
  document.getElementById('loadMore').addEventListener('click', function (e) {
    this.classList.add('load');
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
        this.classList.remove('load');

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
    html += `<div class="issue"><a href="${generateUrlForIssue(item.number)}" class="clearA issueLink"><xmp>${item.title}</xmp></a><div class="issue_comments"><span>${item.comments}</span><img src="/assets/images/chatF.svg" alt=""></div><time datetime="${new Date(item.created_at)}">${new Date(item.created_at).toLocaleString()}</time><div class="issue_labels">`;
    item.labels.forEach(l => {
      html+=`<a href="${generateUrlForLabel(l.name)}" class="issue_label_item clearA" style="border-color: #${l.color}">${l.name}</a>`;
    });
    html +='</div></div>';
  });
  div.innerHTML = html;
  while (div.firstChild){
    container.appendChild(div.firstChild)
  }
}
/** STYLING LABELS */
Array.from(document.querySelectorAll('a.issue_label_item')).forEach(item => {

  item.addEventListener('mouseover', function () {
    let color = `${item.style.borderColor}`;
    item.style.backgroundColor = color;
  });
  item.addEventListener('mouseout', function () {
    let attr = item.getAttribute('data-sel') === 'true';
    if(!attr)
      item.style.backgroundColor = 'transparent';
  });
  item.addEventListener('click', function () {
    let attr = item.getAttribute('data-sel') === 'true';
    if(!attr){
      let color = `${item.style.borderColor}`;
      item.style.backgroundColor = color;
      item.setAttribute('data-sel', 'true');
    }
    else {
      item.style.backgroundColor = 'transparent';
      item.setAttribute('data-sel', 'false');

    }
  });
});

/** OPEN ISSUE PRELOADER */
Array.from(document.querySelectorAll('a.issueLink')).forEach(item=>{
  item.addEventListener('click', function () {
    this.parentNode.classList.add('load');
  });
});
function generateUrlForLabel(name) {
  return `/issues?q=label:${name.includes(' ')? `"${name}"`: name}+repo:${repo}&page=1`
}
function generateUrlForIssue(number) {
  return `/issue/${repo}/${number}`;
}