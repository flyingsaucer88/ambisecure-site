(function () {
  'use strict';

  (function loadAnalyticsConfig() {

    var s = document.createElement('script');
    s.src = '/assets/js/analytics-config.js';
    s.async = false;
    s.defer = true;
    document.head.appendChild(s);
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

    var path = window.location.pathname;
    var section = path.split('/').filter(Boolean)[0] || '';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hSection = href.replace(/^\//, '').split('/').filter(Boolean)[0] || '';
      if (hSection && hSection === section) a.classList.add('active');
    });
  });
})();
