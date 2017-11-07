
window.onload = function () {


  document.getElementById('loginGitHub').addEventListener('click', function () {
    let XHRl = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
    let xhrl = new XHR();
    xhrl.open('POST', '/login');
    xhrl.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhrl.send(JSON.stringify({redirect_url: window.location.href}));
    alert(window.location.href);
    xhrl.onreadystatechange = function () {
      if (xhrl.readyState !== 4) return;

      if (xhrl.status !== 200) {
        alert('ERROR ' + xhrl.status + ': ' + xhrl.statusText);
      }
    };
  });
}