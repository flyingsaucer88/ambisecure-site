/**
 * Thank-you page behaviour: show the submission reference, and fire the one
 * genuine lead conversion event.
 *
 * This page is only ever reached after contact/submit.php has durably accepted
 * an enquiry — the server issues the redirect. That is why the conversion event
 * lives here and not on the submit button: a click cannot know whether the
 * server accepted anything.
 *
 * Privacy: no name, email, phone, company or message is present on this page or
 * in the URL, and none is sent to analytics. The reference is random and not
 * derived from any submitted value.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var ref = params.get('ref') || '';
  var purpose = params.get('purpose') || 'general';

  // Only accept the shapes our own endpoint generates. Anything else is
  // ignored rather than rendered.
  var REF_RE = /^AS-\d{8}-[A-F0-9]{8}$/;
  var PURPOSE_RE = /^[a-z-]{1,32}$/;

  var validRef = REF_RE.test(ref);
  if (!PURPOSE_RE.test(purpose)) { purpose = 'general'; }

  if (validRef) {
    var wrap = document.getElementById('ty-ref');
    var slot = document.getElementById('ty-ref-value');
    if (wrap && slot) {
      slot.textContent = ref;          // textContent, never innerHTML
      wrap.hidden = false;
    }
  }

  // Fire the lead event at most once per reference. Reloads and back-navigation
  // must not inflate the count.
  var key = 'as-lead-' + (validRef ? ref : 'noref');
  var alreadyCounted = false;
  try {
    alreadyCounted = window.sessionStorage.getItem(key) === '1';
  } catch (_) { /* private mode — fall through and rely on the URL strip */ }

  if (validRef && !alreadyCounted) {
    try { window.sessionStorage.setItem(key, '1'); } catch (_) {}

    // Analytics is injected asynchronously by cookie-consent.js and only after
    // the visitor allows analytics, so it is usually NOT loaded yet at this
    // point — and may never load. Queue the event either way: analytics.js
    // drains AS_PENDING_EVENTS when it initialises, and if consent is refused
    // the queue is simply never drained. Firing directly here would drop the
    // conversion in the common case.
    //
    // Parameters carry no PII — only the enquiry topic and the originating
    // form. The authoritative lead count is the server-side store, not GA4.
    var event = {
      name: 'generate_lead',
      value: 1,
      params: { lead_type: purpose, form_id: 'contact_form' }
    };

    if (typeof window.ASTrack === 'function' && window.AS_ANALYTICS &&
        typeof window.AS_ANALYTICS.report === 'function') {
      window.AS_ANALYTICS.report(event);
    } else {
      window.AS_PENDING_EVENTS = window.AS_PENDING_EVENTS || [];
      window.AS_PENDING_EVENTS.push(event);
    }
  }

  // Strip the query string so a refresh or a shared link cannot re-trigger the
  // event, and so the reference does not linger in history or any referrer.
  if (window.history && window.history.replaceState && window.location.search) {
    window.history.replaceState({}, '', window.location.pathname);
  }
})();
