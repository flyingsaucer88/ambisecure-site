/* AmbiSecure — main nav (mobile toggle + active link) + per-page analytics
   loader. Vanilla, no deps. nav.js is included from every page; adding the
   analytics bootstrap here means new pages get analytics automatically without
   touching the template. */
(function () {
  'use strict';

  /* Analytics bootstrap.
     Loads /assets/js/analytics-config.js (defines window.AS_ANALYTICS) then
     /assets/js/analytics.js (loader). If the config file ships with
     `provider: "none"` (the default) the loader is a no-op and no third-party
     network calls happen. To enable a provider, edit analytics-config.js only. */
  (function loadAnalytics() {
    var configScript = document.createElement('script');
    configScript.src = '/assets/js/analytics-config.js';
    configScript.async = false;
    configScript.defer = true;
    configScript.onload = function () {
      var loader = document.createElement('script');
      loader.src = '/assets/js/analytics.js';
      loader.async = false;
      loader.defer = true;
      document.head.appendChild(loader);
    };
    configScript.onerror = function () { /* analytics config missing — silently skip */ };
    document.head.appendChild(configScript);
  })();

  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        var open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navLinks.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* mark current section in main nav based on path */
    var path = window.location.pathname;
    var section = path.split('/').filter(Boolean)[0] || '';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hSection = href.replace(/^\//, '').split('/').filter(Boolean)[0] || '';
      if (hSection && hSection === section) a.classList.add('active');
    });
  });
})();
