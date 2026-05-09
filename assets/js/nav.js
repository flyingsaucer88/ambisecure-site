/* AmbiSecure — main nav (mobile toggle + active link). Vanilla, no deps. */
(function () {
  'use strict';

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
