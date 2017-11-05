'use strict';
let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
let xhr = new XHR();
let repoOwner = '';
let repoName = '';

/** page of comments */
let page = 1;

/** REPO FORM SUBMIT handler */
document.getElementById('queryForm').addEventListener('submit', function (e) {
  e.preventDefault();
  repoOwner = this.repoOwner.value.trim();
  repoName = this.repoName.value.trim();

  xhr.open('POST', '/repo');
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.send(JSON.stringify({ repoOwner, repoName }));

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200)
    {
      alert('ERROR ' + xhr.status + ': ' + xhr.statusText);
    }
    else
    {
      let data = xhr.response;
      if(data.includes('%NO%'))
      {
        alert('there are no such repo');
        return;
      }
      let labels = JSON.parse(data);
      // console.log(labels);
      showLabels(labels);

      /** REQUEST FOR COMMENTS */
      xhr.open('POST', '/loadcomments');
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.send(JSON.stringify({page: page, repoOwner, repoName}));

      xhr.onreadystatechange = function () {
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
          let comments = JSON.parse(data);
          showComments(comments.comments);
          if (comments.isLoadMoreBtn) {
            document.getElementById('loadMore_container').innerHTML = '<div id="loadMore">Load more</div>';

            /** LOAD MORE COMMENTS button handler */
            document.getElementById('loadMore').addEventListener('click', function (e) {
              page++;
              xhr.open('POST', '/loadcomments');
              xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
              xhr.send(JSON.stringify({page: page, repoOwner, repoName}));

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
                  let comments = JSON.parse(data);
                  console.log(comments);
                  if (!comments.isLoadMoreBtn) {

                    this.parentNode.removeChild(this);
                  }
                  showComments(comments.comments);
                }
              }).bind(this);
            });
          }
        }
      };
    }
  }
});

/** SHOW LABELS function */
function showLabels(labs) {
  let container = document.getElementById('labels');
  let html = '';
  labs.forEach(item => {
    if(!item.isNested){
      /** add simple label */
      html += `<label><input type="checkbox" class="label_item" value="${item.name}"/><span class="label_name">${item.name}</span></label>`;
    }
    else {
      /** add group of labels */
      html += `<div class="label_group"><span class="label_group_name">${item.name}</span>`;
      item.items.forEach(nestedItem => {
        html += `<label><input type="checkbox" class="label_item" value="${nestedItem.fullName}"/><span class="label_name">${nestedItem.name}</span></label>`;
      });
      html+='</div>';
    }
  });
  html += '<input  type="submit"/>';
  container.innerHTML = html;
}

/** LABELS FORM SUBMIT handler */
document.getElementById('labels').addEventListener('submit', function (e) {
  e.preventDefault();

  /** get all checked checkboxes */

  let selectedLabels = Array.from(document.querySelectorAll('input.label_item')).filter(item =>item.checked);

  let labelsStr = selectedLabels.map(item => {
    let name = item.value;
    if(name.includes(' ')){
      return `label:"${name}"+`;

    }
    else {
      return `label:${name}+`;
    }
  }).join('');

  let query = `/issues?q=${labelsStr}repo:${repoOwner}/${repoName}&page=1`;

  window.location.href = query;
});


function showComments (comments) {
  let container = document.getElementById('repo_comments_container');
  let div = document.createElement('div');
  let html = '';
  comments.forEach(item => {
    html += `<div class="comment"><a href="${item.user.html_url}">${item.user.login}</a><div class="comment_avatar"></div><div class="comment_body">${item.body}</div></div>`;
  });
  div.innerHTML = html;
  while (div.firstChild){
    container.appendChild(div.firstChild)
  }

}

