(function () {
  'use strict';


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
    configScript.onerror = function () {  };
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


    var path = window.location.pathname;
    var section = path.split('/').filter(Boolean)[0] || '';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hSection = href.replace(/^\//, '').split('/').filter(Boolean)[0] || '';
      if (hSection && hSection === section) a.classList.add('active');
    });
  });
})();
