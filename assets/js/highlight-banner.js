(function () {
  'use strict';

  var slots = document.querySelectorAll('.hp-banner-slot');
  if (!slots.length) return;
  if (!window.AS_HOMEPAGE_BANNERS || !Array.isArray(window.AS_HOMEPAGE_BANNERS)) return;

  var now = Date.now();
  var active = [];
  for (var i = 0; i < window.AS_HOMEPAGE_BANNERS.length; i++) {
    var b = window.AS_HOMEPAGE_BANNERS[i];
    if (!b || !b.enabled) continue;
    if (b.startsAt && now < new Date(b.startsAt).getTime()) continue;
    if (b.endsAt && now > new Date(b.endsAt).getTime()) continue;
    if (!b.primaryCta || !b.primaryCta.url) continue;
    active.push(b);
  }

  if (!active.length) {
    slots.forEach(function (s) { s.style.display = 'none'; });
    return;
  }

  // Phase 28: deterministic daily rotation.
  // Day index = whole UTC days since the epoch. Every visitor on the same UTC
  // day picks the same slide; the slide changes automatically at UTC midnight.
  function dayIndex() {
    return Math.floor(now / 86400000);
  }
  var pick = active[((dayIndex() % active.length) + active.length) % active.length];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function accentVar(a) {
    if (a === 'cyan') return 'var(--secure-cyan,#0E8C9C)';
    if (a === 'dark') return 'var(--ink,#3A3F40)';
    return 'var(--brand-red,#E3222A)';
  }

  function renderSlide(p) {
    var accent = accentVar(p.accent);
    var secondaryCta = '';
    if (p.secondaryCta && p.secondaryCta.url) {
      secondaryCta = '<a href="' + esc(p.secondaryCta.url) + '" class="btn btn-outline">' + esc(p.secondaryCta.label) + '</a>';
    }
    var tertiaryCta = '';
    if (p.tertiaryCta && p.tertiaryCta.url) {
      tertiaryCta = '<a href="' + esc(p.tertiaryCta.url) + '" class="btn btn-outline">' + esc(p.tertiaryCta.label) + '</a>';
    }
    return ''
      + '<article class="deb-slide hp-banner-slide is-active" data-accent="' + esc(p.accent || 'red') + '" data-id="' + esc(p.id || '') + '" style="--banner-accent:' + accent + ';">'
      +   '<div class="deb-badge"><span class="deb-badge-dot" aria-hidden="true"></span>AmbiSecure ecosystem &middot; rotates daily</div>'
      +   '<div class="deb-body hp-banner-body">'
      +     '<div class="deb-eyebrow hp-banner-eyebrow">' + esc(p.eyebrow || 'Featured') + '</div>'
      +     '<h2 class="deb-title hp-banner-title">' + esc(p.title) + '</h2>'
      +     '<p class="deb-text hp-banner-text">' + esc(p.body) + '</p>'
      +   '</div>'
      +   '<div class="deb-ctas hp-banner-ctas">'
      +     '<a href="' + esc(p.primaryCta.url) + '" class="btn btn-primary">' + esc(p.primaryCta.label) + '</a>'
      +     secondaryCta
      +     tertiaryCta
      +   '</div>'
      + '</article>';
  }

  // Mount each slot with the rendered slide. Outer wrapper (.daily-ecosystem-banner)
  // already carries the prominent visual treatment from main.css.
  slots.forEach(function (slot) {
    var shell = slot.closest('.deb-shell');
    if (shell) shell.setAttribute('data-accent', pick.accent || 'red');
    slot.innerHTML = renderSlide(pick);
  });
})();
