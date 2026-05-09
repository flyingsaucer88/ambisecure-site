/* AmbiSecure — RP ID / origin validator.
   Rules from WebAuthn §5.1.3 (RP ID is a registrable domain suffix of the
   origin's effective domain, or equal to it). This tool walks a list of
   origin/rpId pairs and tells you which combinations a UA would accept. */
(function () {
  'use strict';

  function row(label, value, note, ok) {
    var badge = ok === true ? 'tech-badge--ok' : ok === false ? 'tech-badge--err' : 'tech-badge';
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value"><span class="tech-badge ' + badge + '">' + value + '</span></div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function isPrivateAddress(host) {
    if (host === 'localhost') return true;
    if (/^127\./.test(host)) return true;
    if (host === '::1') return true;
    if (/^192\.168\./.test(host)) return true;
    if (/^10\./.test(host)) return true;
    return false;
  }

  function validate(origin, rpId) {
    var u;
    try { u = new URL(origin); } catch (e) { return { ok: false, reasons: ['origin is not a valid URL'] }; }
    var reasons = [];
    var ok = true;

    if (u.protocol !== 'https:' && !isPrivateAddress(u.hostname)) {
      ok = false; reasons.push('Origin must be HTTPS (except for localhost / loopback during development).');
    } else if (u.protocol !== 'https:' && isPrivateAddress(u.hostname)) {
      reasons.push('Localhost / loopback HTTP allowed only for development.');
    }

    var host = u.hostname.toLowerCase();
    var rp = String(rpId || host).toLowerCase();

    if (rp.indexOf('http') === 0 || rp.indexOf('/') !== -1) {
      ok = false; reasons.push('RP ID must be a domain (host only) — no scheme, no path.');
    }
    if (rp.indexOf(':') !== -1) {
      ok = false; reasons.push('RP ID must not include a port.');
    }

    if (rp === host) {
      reasons.push('RP ID equals origin host (most common, recommended).');
    } else if (host.endsWith('.' + rp)) {
      reasons.push('RP ID is a registrable suffix of origin host (e.g. login.example.com → example.com). UA should accept.');
    } else {
      ok = false; reasons.push('RP ID is NOT a registrable suffix of origin host. The browser will reject this ceremony.');
    }

    // PSL warnings
    var TLD_LIKE = /\.(com|net|org|edu|gov|io|co|me|app|dev|test|local)$/;
    if (rp === 'com' || rp === 'co.uk' || rp === 'co.in' || /^[a-z]{2,3}$/.test(rp)) {
      ok = false; reasons.push('RP ID looks like a public suffix. The Public Suffix List forbids registering at this level.');
    }

    return { ok: ok, reasons: reasons, rp: rp, host: host, scheme: u.protocol, port: u.port };
  }

  function init() {
    var origin = AS.$('rp-origin'), rpId = AS.$('rp-rpid'), output = AS.$('rp-output');
    var sample = AS.$('rp-sample'), clearBtn = AS.$('rp-clear');
    if (!origin || !rpId || !output) return;

    function go() {
      var o = (origin.value || '').trim();
      var r = (rpId.value || '').trim();
      if (!o) { AS.renderPlaceholder(output, 'Enter an origin (e.g. https://login.example.com).'); return; }
      var res = validate(o, r);
      var html = '<div style="margin-bottom:14px;">' +
        '<span class="tech-badge ' + (res.ok ? 'tech-badge--ok' : 'tech-badge--err') + '">' +
        (res.ok ? 'COMBINATION ALLOWED' : 'COMBINATION REJECTED') + '</span></div>';
      html += row('origin', AS.escHTML(o), 'scheme: ' + res.scheme + ' &middot; host: ' + res.host + (res.port ? ' &middot; port: ' + res.port : ''));
      html += row('rpId (effective)', AS.escHTML(res.rp), r ? 'Specified explicitly.' : 'Defaulted to origin host (no rpId in ceremony options).');
      html += '<div class="parsed-row"><span class="label">Notes</span><div><ul style="margin:0; padding-left:18px; font-size:13.5px; line-height:1.65; color:var(--brand-grey);">' +
        res.reasons.map(function (x) { return '<li>' + AS.escHTML(x) + '</li>'; }).join('') +
        '</ul></div></div>';
      html += '<div class="note" style="margin-top:14px; padding:12px 14px; background:var(--brand-soft); border-radius:4px;">' +
        '<strong>WebAuthn rule (§5.1.3):</strong> the rpId must be a <em>registrable domain suffix</em> of, or equal to, the origin\'s effective domain. ' +
        'Setting <code>rpId = example.com</code> on a page served from <code>login.example.com</code> creates a credential usable across all <code>*.example.com</code> hosts.</div>';
      output.innerHTML = html;
    }
    origin.addEventListener('input', go); rpId.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      origin.value = 'https://login.example.com'; rpId.value = 'example.com'; go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { origin.value=''; rpId.value=''; go(); origin.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
