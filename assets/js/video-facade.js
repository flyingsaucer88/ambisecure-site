/**
 * AmbiSecure — lightweight YouTube facade.
 *
 * Replaces the heavy YouTube iframe with a click-to-play poster image.
 * Saves ~500 KB of JS + tracker network traffic on every page that
 * lists videos until the visitor actually clicks Play.
 *
 * Markup contract:
 *   <div class="yt-facade" data-yt-id="9TwKvC7cqOE" data-title="..."
 *        data-poster="/assets/img/videos/9TwKvC7cqOE.webp">
 *     <img class="yt-facade-poster" src="…" alt="…" loading="lazy" decoding="async" />
 *     <button class="yt-facade-play" aria-label="Play video">&#9658;</button>
 *   </div>
 *
 * On click, the entire facade is replaced by an <iframe> with
 *   src="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0"
 * (youtube-nocookie hostname is privacy-friendlier than youtube.com).
 *
 * CSP impact: enabling YouTube playback requires
 *   frame-src 'self' https://www.youtube-nocookie.com;
 * (Currently `frame-ancestors 'none'` is set but `frame-src` is not, so
 * the page can't be framed BUT YT can't load either. Add `frame-src` in
 * .htaccess when shipping the videos page — see docs/23.)
 */
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

        // Clear children and inject iframe
        while (facade.firstChild) facade.removeChild(facade.firstChild);
        facade.appendChild(iframe);
      }

      btn.addEventListener('click', activate);
      // Also activate on Enter/Space when the button is focused — handled
      // by the native <button> default; nothing additional needed.
    });
  });
})();
