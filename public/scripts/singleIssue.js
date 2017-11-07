'use strict';
window.onload = function () {
  /** SHOW AND HIDE BUTTON handler */
  let isClosed = true;
  document.getElementById('chat_button').addEventListener('click', function () {
    this.firstChild.style.animation = 'none';
    if(isClosed){
      this.firstChild.style.transform = 'rotate(-45deg)';
      document.getElementById('issue_message_container').style.transform = 'translateY(0px)';
    }
    else {
      this.firstChild.style.transform = 'rotate(135deg)';
      document.getElementById('issue_message_container').style.transform = 'translateY(250px)';
    }
    isClosed=!isClosed;
  });




  let socket = io.connect('https://fat-git.herokuapp.com');
  socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
  });
  socket.on('messages', function(data) {

    showMessage(data.comment);
    window.scrollTo(0,document.body.scrollHeight);
    if(isLogged)
      sendButton.parentNode.classList.remove('load');

  });
  if(!isLogged) return;
  let sendButton = document.getElementById('sendButton');

  document.getElementById('newMessage').addEventListener('submit', function (e) {
    e.preventDefault();
    let text = this.text.value.trim();
    this.text.value = '';
    socket.emit('send', {message: text});
    sendButton.parentNode.classList.add('load');
  });

  /** SEND BY ENTER */
  document.getElementById('textarea_message').addEventListener('keydown',function (event) {
    if (event.keyCode === 13 && !event.shiftKey) { //если нажали Enter, то true

      /** send message */
      let text = document.getElementById('newMessage').text.value.trim();
      document.getElementById('newMessage').text.value = '';
      socket.emit('send', {message: text});
      return false;
    }
  });




  function showMessage(comment) {
    let container = document.getElementById('issue_comments_container');
    let div = document.createElement('div');
    let text = comment.body.replace(/\n/gm, '</br>');

    let html = `<div class="issue_comments_item">
      <div class="issue_comments_item_header">
        <div class="issue_comments_item_user_avatar" style="background-image: url(${comment.user.avatar_url})"></div> 
        <div class="issue_comments_item_user_info">
          <a href="${comment.user.html_url}" class="issue_comments_item_user_login clearA" target="_blank">${comment.user.login}</a>
          <time datetime="${new Date(comment.created_at)}">${new Date(comment.created_at).toLocaleString()}</time>
        </div>
      </div>
      <div class="issue_comments_item_body markDown">${text}</div>
    </div>`;

    div.innerHTML = html;
    while (div.firstChild){
      container.appendChild(div.firstChild)
    }
  }

};



