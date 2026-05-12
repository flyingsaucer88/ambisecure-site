(function () {
  'use strict';

  var KEY = 'as-consent';
  var ANALYTICS_KEY = 'as-analytics-opt-out';
  var PRIVACY_URL = '/privacy/';

  function read() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (_) {}
  }
  function clearOptOut() {
    try { localStorage.removeItem(ANALYTICS_KEY); } catch (_) {}
  }
  function setOptOut() {
    try { localStorage.setItem(ANALYTICS_KEY, '1'); } catch (_) {}
  }
  function dntOn() {
    var d = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return d === '1' || d === 'yes';
  }

  function show() {
    if (document.querySelector('.as-consent')) return;
    var el = document.createElement('aside');
    el.className = 'as-consent is-open';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie and analytics notice');
    el.innerHTML =
      '<div class="as-consent-row">' +
      '  <div class="as-consent-body">' +
      '    <h3>Privacy-first analytics</h3>' +
      '    <p>AmbiSecure does not store personal data, profile users, or share data with advertisers. We use lightweight, aggregate analytics to understand which engineering content is useful. Decline if you prefer &mdash; the site works either way.</p>' +
      '    <p><a href="' + PRIVACY_URL + '">Read the privacy notice &rarr;</a></p>' +
      '  </div>' +
      '  <div class="as-consent-actions">' +
      '    <button type="button" class="as-consent-btn" data-action="decline">Decline</button>' +
      '    <button type="button" class="as-consent-btn is-primary" data-action="accept">Allow analytics</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.dataset || !t.dataset.action) return;
      if (t.dataset.action === 'accept') {
        write('granted');
        clearOptOut();
        loadAnalyticsIfConfigured();
      } else {
        write('denied');
        setOptOut();
      }
      el.classList.remove('is-open');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 150);
    });
  }

  function loadAnalyticsIfConfigured() {
    var cfg = window.AS_ANALYTICS;
    if (!cfg || cfg.provider === 'none') return;
    if (window._asAnalyticsLoaded) return;
    var s = document.createElement('script');
    s.src = '/assets/js/analytics.js';
    s.defer = true;
    document.head.appendChild(s);
    window._asAnalyticsLoaded = true;
  }

  function init() {
    var state = read();
    if (state === 'granted') {
      clearOptOut();
      loadAnalyticsIfConfigured();
      return;
    }
    if (state === 'denied') {
      setOptOut();
      return;
    }

    if (dntOn()) {
      setOptOut();
      return;
    }
    show();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  window.AS_CONSENT = {
    state: function () { return read(); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (_) {} clearOptOut(); show(); },
  };
})();
