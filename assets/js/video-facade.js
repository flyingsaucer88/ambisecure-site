(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var facades = document.querySelectorAll('.yt-facade');
    if (!facades.length) return;

    facades.forEach(function (facade) {
      var btn = facade.querySelector('.yt-facade-play');
      if (!btn) return;
      var ytId = facade.getAttribute('data-yt-id');
      var title = facade.getAttribute('data-title') || 'YouTube video';
      if (!ytId) return;

      function activate() {
        if (facade.dataset.activated === '1') return;
        facade.dataset.activated = '1';

        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' +
                     encodeURIComponent(ytId) +
                     '?autoplay=1&rel=0&modestbranding=1';
        iframe.title = title;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; ' +
                       'encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.loading = 'eager';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';

        while (facade.firstChild) facade.removeChild(facade.firstChild);
        facade.appendChild(iframe);
      }

      btn.addEventListener('click', activate);

    });
  });
})();
