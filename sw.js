self.addEventListener('install', e => {
  e.waitUntil(
    // после установки service worker
    // открыть новый кэш
    caches.open('my-pwa-cache').then(cache => {
      // добавляем все URL ресурсов, которые хотим закэшировать
      return cache.addAll([
        '/',
        '/profile',
        '/about',
        '/assets/images/logo.png',
        '/assets/images/lapkaGotovaya.svg',
        '/assets/images/background0.jpg',
        '/styles/css/main.css',
        '/styles/css/base.css',
        '/styles/css/reset.css',
        '/styles/css/preloaders.css',
        '/styles/css/error.css',
        '/styles/css/header.css',
        '/styles/css/about.css',
        '/styles/css/issues.css',
        '/styles/css/profile.css',
        '/styles/css/singleIssue.css',
        '/scripts/index.js',
        '/scripts/about.js',
        '/scripts/issues.js',
        '/scripts/preloaders.js',
        '/scripts/singleIssue.js'
      ]);
    })
  );
});