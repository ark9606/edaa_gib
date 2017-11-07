'use strict';
let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
let xhr = new XHR();
let repoOwner = '';
let repoName = '';

/** page of comments */
let page = 1;
let searchButton =  document.getElementById('searchButton');
let loadMoreButton;
let chooseButton;
/** REPO FORM SUBMIT handler */
document.getElementById('queryForm').addEventListener('submit', function (e) {
  e.preventDefault();
  repoOwner = this.repoOwner.value.trim();
  repoName = this.repoName.value.trim();

  xhr.open('POST', '/repo');
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.send(JSON.stringify({ repoOwner, repoName }));

  searchButton.parentNode.classList.add('load');

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200)
    {
      alert('ERROR ' + xhr.status + ': ' + xhr.statusText);
    }
    else
    {
      searchButton.parentNode.classList.remove('load');


      let data = xhr.response;
      if(data.includes('%NO%'))
      {
        alert('there are no such repo');
        return;
      }
      let labels = JSON.parse(data);
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
          document.getElementById('repo_comments_container').innerHTML = '<h2>Comments</h2> <hr>';

          showComments(comments.comments);
          if (comments.isLoadMoreBtn) {
            document.getElementById('loadMore_container').innerHTML = '<div id="loadMore" class="button">Load more</div>';
            loadMoreButton =  document.getElementById('loadMore');

            /** LOAD MORE COMMENTS button handler */
            loadMoreButton.addEventListener('click', function (e) {
              loadMoreButton.classList.add('load');

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
                  loadMoreButton.classList.remove('load');
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
      html += `<label><input type="checkbox" class="label_item" value="${item.name}"/><span class="label_name" data-sel="false" style="border-color: #${item.color}">${item.name}</span></label>`;
    }
    else {
      /** add group of labels */
      html += `<div class="label_group"><span class="label_group_name">${item.name}</span>`;
      item.items.forEach(nestedItem => {
        html += `<label><input type="checkbox" class="label_item" value="${nestedItem.fullName}"/><span class="label_name" data-sel="false" style="border-color: #${nestedItem.color}">${nestedItem.name}</span></label>`;
      });
      html+='</div>';
    }
  });
  html += '<div class="chooseBtn_container"><div class="button_container"><input  type="submit" id="chooseButton" value="Choose" title="Show issues with selected labels"/></div></div>';
  container.innerHTML = html;

  chooseButton = document.getElementById('chooseButton');
  chooseButton.addEventListener('click', function () {
    chooseButton.parentNode.classList.add('load');
  });

  /** STYLING LABELS */
  Array.from(document.querySelectorAll('span.label_name')).forEach(item => {

    item.addEventListener('mouseover', function () {
      let color = `${item.style.borderColor}`;
      item.style.backgroundColor = color;
    });
    item.addEventListener('mouseout', function () {
      let attr = item.getAttribute('data-sel') === 'true';
      if(!attr)
        // item.style.backgroundColor = 'transparent';
        item.style.backgroundColor = '#f7f7f7';
    });
    item.addEventListener('click', function () {
      let attr = item.getAttribute('data-sel') === 'true';
      if(!attr){
        let color = `${item.style.borderColor}`;
        item.style.backgroundColor = color;
        item.setAttribute('data-sel', 'true');
      }
      else {
        // item.style.backgroundColor = 'transparent';
        item.style.backgroundColor = '#f7f7f7';
        item.setAttribute('data-sel', 'false');
      }
    });
  });
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
    html += `<div class="comment"><div class="comment_avatar" style="background-image: url(${item.user.avatar_url})"></div><div class="columnComment"><a href="${item.user.html_url}" class="userUrl clearA" target="_blank">${item.user.login}</a><time datetime="${new Date(item.created_at)}">${new Date(item.created_at).toLocaleString()}</time></div><a href="${item.html_url}" class="commentUrl clearA" target="_blank">Open on GitHub</a><div class="comment_body markDown">${item.body}</div></div>`;
  });
  div.innerHTML = html;
  while (div.firstChild){
    container.appendChild(div.firstChild)
  }
}

