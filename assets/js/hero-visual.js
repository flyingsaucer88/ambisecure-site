(function () {
  'use strict';

  var mounts = document.querySelectorAll('[data-hero-visual]');
  if (!mounts.length) return;
  if (!window.AS_HERO_VISUAL_THEMES || !Array.isArray(window.AS_HERO_VISUAL_THEMES)) return;
  var themes = window.AS_HERO_VISUAL_THEMES.filter(function (t) { return t && t.label && t.caption; });
  if (!themes.length) return;

  // Deterministic daily picker: whole UTC days since the epoch.
  var now = Date.now();
  var dayIndex = Math.floor(now / 86400000);
  var pick = themes[((dayIndex % themes.length) + themes.length) % themes.length];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // Inline SVG strings come from the config we author — not user input —
  // so passing them through innerHTML is safe.
  function render(p) {
    var crest = '/assets/img/og/ambisecure-logo-og.jpg';
    var ctaHtml = '';
    if (p.cta && p.cta.url && p.cta.label) {
      ctaHtml = '<a class="hero-visual-cta" href="' + esc(p.cta.url) + '">' + esc(p.cta.label) + ' <span aria-hidden="true">&rarr;</span></a>';
    }
    return ''
      + '<div class="hero-visual" data-theme="' + esc(p.id || 'identity-root') + '" data-accent="' + esc(p.accent || 'red') + '">'
      +   '<div class="hero-visual-medallion">'
      +     '<img src="' + crest + '" alt="AmbiSecure — hardware-rooted security crest" class="hero-visual-crest hero-crest" width="512" height="512" loading="eager" decoding="async" fetchpriority="high" />'
      +     '<span class="hero-visual-badge" aria-hidden="true">' + (p.icon || '') + '</span>'
      +   '</div>'
      +   '<div class="hero-visual-meta">'
      +     '<span class="hero-visual-eyebrow"><span class="hero-visual-dot" aria-hidden="true"></span>Today&rsquo;s focus &middot; rotates daily</span>'
      +     '<span class="hero-visual-label">' + esc(p.label) + '</span>'
      +     '<p class="hero-visual-caption">' + esc(p.caption) + '</p>'
      +     ctaHtml
      +   '</div>'
      + '</div>';
  }

  var html = render(pick);
  mounts.forEach(function (m) { m.innerHTML = html; });
})();
