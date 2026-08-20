/**
 * Contact form enhancement.
 *
 * The form works with JavaScript disabled: it is a plain POST to
 * /contact/submit.php, which 303-redirects to /contact/thank-you/ on success
 * or back to /contact/?err=... on failure. Everything here is enhancement on
 * top of that — inline errors, preserved input, and a purpose preselected from
 * the query string.
 *
 * No analytics dependency: the form must work whether or not the visitor has
 * consented to analytics. The lead conversion event is fired by the thank-you
 * page, never from here, because only the server can say an enquiry was
 * actually accepted.
 */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var statusBox = document.getElementById('form-status');
  var submitBtn = document.getElementById('cf-submit');
  var purposeEl = document.getElementById('cf-purpose');

  // Timing signal for the endpoint's bot check. Absent without JS, in which
  // case the server skips the check rather than penalising no-JS visitors.
  var tsEl = document.getElementById('cf-ts');
  if (tsEl) { tsEl.value = String(Math.floor(Date.now() / 1000)); }

  // ---- query-string handling ---------------------------------------------
  // Values are only ever compared against the <option> values already present
  // in the DOM, so nothing from the URL is interpolated into the page.
  var params = new URLSearchParams(window.location.search);

  var wanted = params.get('purpose');
  if (wanted && purposeEl) {
    var allowed = Array.prototype.map.call(purposeEl.options, function (o) { return o.value; });
    if (allowed.indexOf(wanted) !== -1) {
      purposeEl.value = wanted;
    }
  }

  var ERROR_TEXT = {
    validation: 'Some details need correcting. Please check the highlighted fields below.',
    ratelimit:  'That is a few too many enquiries in a short time. Please wait a little and try again, or email support@ambimat.com.',
    origin:     'That submission could not be verified. Please reload this page and try again.',
    toolarge:   'That message is too long. Please shorten it and try again.',
    method:     'Something went wrong submitting the form. Please try again.',
    server:     'We could not record your enquiry just now. Please try again, or email support@ambimat.com directly.'
  };

  function showStatus(message, kind) {
    if (!statusBox) { return; }
    statusBox.textContent = message;
    statusBox.className = 'cf-status ' + (kind || 'is-error');
    statusBox.hidden = false;
  }

  function clearStatus() {
    if (statusBox) { statusBox.hidden = true; statusBox.textContent = ''; }
  }

  function fieldError(name, on) {
    var input = form.querySelector('[name="' + name + '"]');
    var err = document.getElementById('cf-' + name + '-err');
    if (input) { input.setAttribute('aria-invalid', on ? 'true' : 'false'); }
    if (err) { err.hidden = !on; }
  }

  function clearFieldErrors() {
    ['name', 'email', 'message'].forEach(function (f) { fieldError(f, false); });
  }

  function markFields(fields) {
    clearFieldErrors();
    (fields || []).forEach(function (f) { fieldError(f, true); });
    var first = form.querySelector('[aria-invalid="true"]');
    if (first) { first.focus(); }
  }

  // Surface an error carried back from the no-JS redirect path.
  var err = params.get('err');
  if (err && Object.prototype.hasOwnProperty.call(ERROR_TEXT, err)) {
    showStatus(ERROR_TEXT[err], 'is-error');
    var flagged = (params.get('f') || '').split(',').filter(Boolean);
    if (flagged.length) { markFields(flagged); }
    // Drop the error params so a reload does not re-display a stale message.
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // ---- client-side pre-checks --------------------------------------------
  // Mirrors the server rules. The server remains the authority; this only
  // saves a round trip and gives faster, better-associated feedback.
  function validate() {
    var bad = [];
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;

    if (!name.value.trim()) { bad.push('name'); }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      bad.push('email');
    }
    if (message.value.trim().length < 10) { bad.push('message'); }
    return bad;
  }

  form.addEventListener('submit', function (e) {
    var bad = validate();
    if (bad.length) {
      e.preventDefault();
      showStatus(ERROR_TEXT.validation, 'is-error');
      markFields(bad);
      return;
    }

    // fetch() is the enhancement. If it is unavailable, fall through to the
    // native POST, which the server handles identically.
    if (typeof window.fetch !== 'function') { return; }

    e.preventDefault();
    clearStatus();
    clearFieldErrors();
    submitBtn.setAttribute('aria-disabled', 'true');
    submitBtn.disabled = true;
    showStatus('Sending your enquiry…', 'is-busy');

    fetch(form.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(form)),
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'fetch',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin'
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false, error: 'server' }; });
    }).then(function (data) {
      if (data && data.ok) {
        // Only the server can confirm acceptance, so only now do we move to
        // the thank-you page — which is what fires the lead event.
        var url = '/contact/thank-you/?ref=' + encodeURIComponent(data.ref || '') +
                  '&purpose=' + encodeURIComponent(data.purpose || 'general');
        window.location.assign(url);
        return;
      }
      var code = (data && data.error) || 'server';
      showStatus(ERROR_TEXT[code] || ERROR_TEXT.server, 'is-error');
      markFields(data && data.fields);
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.disabled = false;
    }).catch(function () {
      // Network failure. Never claim success.
      showStatus(ERROR_TEXT.server, 'is-error');
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.disabled = false;
    });
  });

  // Clear a field's error state once the visitor starts fixing it.
  ['name', 'email', 'message'].forEach(function (f) {
    var el = form.querySelector('[name="' + f + '"]');
    if (el) {
      el.addEventListener('input', function () { fieldError(f, false); }, { passive: true });
    }
  });
})();
