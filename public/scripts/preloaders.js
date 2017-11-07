'use strict';
document.body.onload = function () {
  let pagePreloader = document.getElementById('page_preloader');

  let lapka = document.getElementById('lapka');
  let pagePreloaderContent = document.getElementById('page_preloader_content');

  // if(!preloader.classList.contains('done')){
  //   preloader.classList.add('done');
  //   // startAnimation();
  // }

  setTimeout(function () {

  pagePreloaderAnimation();

  }, 500);

  function pagePreloaderAnimation() {
    if(!pagePreloader.classList.contains('done')) {
      lapka.classList.add('up');

      setTimeout(function () {
        pagePreloaderContent.classList.add('down');
        setTimeout(function () {
          pagePreloader.classList.add('done');
        }, 500);
      }, 500);
    }
  }
};
