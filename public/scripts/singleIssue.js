'use strict';
window.onload = function () {
  console.log(isLogged);
  console.log(typeof isLogged);
  if(!isLogged) return;

  let socket = io.connect('http://localhost:3000');
  socket.on('connect', function(data) {
    socket.emit('join', 'Hello World from client');
  });
  socket.on('messages', function(data) {
    // alert(data.message);
    showMessage(data.message, data.login);
  });

  document.getElementById('newMessage').addEventListener('submit', function (e) {
    e.preventDefault();
    let text = this.text.value.trim();
    socket.emit('send', {message: text});
  });

  function showMessage(text, login) {
    let container = document.getElementById('issue_comments_container');
    let div = document.createElement('div');
    text = text.replace(/\n/gm, '</br>');
    console.log(text);
    let html = `<div class="issue_comments_item">
      <div class="issue_comments_item_header">
        <div class="issue_comments_item_user_avatar"></div>
        <div class="issue_comments_item_user_login">${login}</div>
      </div>
      <div class="issue_comments_item_body">${text}</div>
    </div>`;

    div.innerHTML = html;
    while (div.firstChild){
      container.appendChild(div.firstChild)
    }
  }

};



