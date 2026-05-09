/* AmbiSecure — Passkey flow visualiser.
   Step-by-step interactive walkthrough of WebAuthn registration and
   authentication ceremonies. Annotation only — no live ceremony runs. */
(function () {
  'use strict';

  var REG_STEPS = [
    { actor: 'rp', title: 'RP issues PublicKeyCredentialCreationOptions',
      detail: 'Server generates fresh 32-byte challenge, picks rpId, sets user.id (opaque), pubKeyCredParams (e.g. ES256 / -7), attestation policy.' },
    { actor: 'browser', title: 'Browser builds clientDataJSON',
      detail: '{ type: "webauthn.create", challenge, origin, crossOrigin }. The SHA-256 of these bytes is what the authenticator signs.' },
    { actor: 'authenticator', title: 'Authenticator generates a fresh keypair',
      detail: 'Private key never leaves the secure element. Public key encoded as a COSE_Key map.' },
    { actor: 'authenticator', title: 'Authenticator builds authenticatorData + attestation',
      detail: 'rpIdHash | flags(UP+UV+AT) | signCount | aaguid | credLen | credId | publicKey, with attestation signature over authData || SHA-256(clientDataJSON).' },
    { actor: 'browser', title: 'Browser returns PublicKeyCredential',
      detail: 'response.attestationObject (CBOR), response.clientDataJSON, credentialId, transports.' },
    { actor: 'rp', title: 'RP verifies and persists',
      detail: 'Verify clientData (type/challenge/origin), rpIdHash, flags, attestation if required, MDS / AAGUID policy. Persist credentialId, publicKey, signCount.' }
  ];

  var AUTH_STEPS = [
    { actor: 'rp', title: 'RP issues PublicKeyCredentialRequestOptions',
      detail: 'Fresh challenge, rpId, optional allowCredentials (credentialId list), userVerification policy.' },
    { actor: 'browser', title: 'Browser builds clientDataJSON',
      detail: '{ type: "webauthn.get", challenge, origin, crossOrigin }.' },
    { actor: 'authenticator', title: 'Authenticator selects credential',
      detail: 'For discoverable creds: matches by rpId. For non-discoverable: matches by credentialId from allowCredentials.' },
    { actor: 'authenticator', title: 'Authenticator signs assertion',
      detail: 'signature = sign(privateKey, authData || SHA-256(clientDataJSON)). authData carries fresh signCount and BS flag.' },
    { actor: 'browser', title: 'Browser returns assertion',
      detail: 'response.authenticatorData, response.signature, response.clientDataJSON, response.userHandle (for discoverable creds).' },
    { actor: 'rp', title: 'RP verifies signature',
      detail: 'Look up storedPublicKey by credentialId. Verify clientData. Verify rpIdHash. Verify UP/UV. Verify signature. Verify signCount strictly increases (or both 0).' }
  ];

  function actorClass(a) { return a === 'rp' ? 'fv-actor red' : a === 'authenticator' ? 'fv-actor cyan' : 'fv-actor'; }

  function render(steps) {
    var html = '';
    steps.forEach(function (s, i) {
      html += '<div class="seq-step" style="border-left:3px solid var(--secure-cyan);">' +
        '<span class="seq-n">Step ' + (i + 1) + ' &middot; ' + s.actor.toUpperCase() + '</span>' +
        '<span class="seq-h">' + AS.escHTML(s.title) + '</span>' +
        '<p>' + s.detail + '</p>' +
        '</div>';
    });
    return '<div class="seq-grid">' + html + '</div>';
  }

  function init() {
    var output = AS.$('pf-output'), buttons = document.querySelectorAll('[data-pf-mode]');
    if (!output) return;

    function show(mode) {
      buttons.forEach(function (b) { b.classList.toggle('tool-action--primary', b.dataset.pfMode === mode); });
      var steps = mode === 'auth' ? AUTH_STEPS : REG_STEPS;
      var heading = mode === 'auth' ? 'Authentication ceremony' : 'Registration ceremony';
      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + heading + '</span> <span class="tech-badge">' + steps.length + ' steps</span></div>';
      html += render(steps);
      html += '<div class="note" style="margin-top:18px; padding:12px 16px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
        '<strong>Annotation only.</strong> This visualiser does not run live ceremonies. Use the <a href="/resources/tools/clientdata-decoder/">clientDataJSON decoder</a>, <a href="/resources/tools/authdata-parser/">authenticatorData parser</a>, and <a href="/resources/tools/attestation-decoder/">attestation decoder</a> to walk live ceremony bytes.</div>';
      output.innerHTML = html;
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.pfMode); }); });
    show('register');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
