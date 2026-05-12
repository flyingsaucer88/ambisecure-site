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

  function renderSlide(pick) {
    var accent = accentVar(pick.accent);
    var secondaryCta = '';
    if (pick.secondaryCta && pick.secondaryCta.url) {
      secondaryCta = '<a href="' + esc(pick.secondaryCta.url) + '" class="btn btn-outline">' + esc(pick.secondaryCta.label) + '</a>';
    }
    return ''
      + '<article class="hp-banner-slide" data-accent="' + esc(pick.accent || 'red') + '" style="--banner-accent:' + accent + ';">'
      +   '<div class="hp-banner-body">'
      +     '<div class="hp-banner-eyebrow">' + esc(pick.eyebrow || 'Featured') + '</div>'
      +     '<h2 class="hp-banner-title">' + esc(pick.title) + '</h2>'
      +     '<p class="hp-banner-text">' + esc(pick.body) + '</p>'
      +   '</div>'
      +   '<div class="hp-banner-ctas">'
      +     '<a href="' + esc(pick.primaryCta.url) + '" class="btn btn-primary">' + esc(pick.primaryCta.label) + '</a>'
      +     secondaryCta
      +   '</div>'
      + '</article>';
  }

  function renderCarousel(slot) {
    var slidesHtml = active.map(renderSlide).join('');
    var dotsHtml = '';
    if (active.length > 1) {
      for (var i = 0; i < active.length; i++) {
        dotsHtml += '<button type="button" class="hp-banner-dot" data-index="' + i + '" aria-label="Show highlight ' + (i + 1) + ' of ' + active.length + '"></button>';
      }
    }
    var controlsHtml = '';
    if (active.length > 1) {
      controlsHtml =
        '<button type="button" class="hp-banner-nav hp-banner-prev" aria-label="Previous highlight">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
        '</button>' +
        '<button type="button" class="hp-banner-nav hp-banner-next" aria-label="Next highlight">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
        '</button>';
    }

    slot.innerHTML =
      '<div class="hp-banner" data-count="' + active.length + '" aria-roledescription="carousel" aria-label="Featured highlights">' +
        '<div class="hp-banner-track">' + slidesHtml + '</div>' +
        controlsHtml +
        (dotsHtml ? '<div class="hp-banner-dots" role="tablist" aria-label="Choose highlight">' + dotsHtml + '</div>' : '') +
      '</div>';

    return slot.querySelector('.hp-banner');
  }

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}

  slots.forEach(function (slot) {
    var root = renderCarousel(slot);
    if (!root) return;

    var slides = root.querySelectorAll('.hp-banner-slide');
    var dots = root.querySelectorAll('.hp-banner-dot');
    var current = 0;
    var timer = null;
    var paused = false;

    function show(idx) {
      current = ((idx % slides.length) + slides.length) % slides.length;
      for (var i = 0; i < slides.length; i++) {
        slides[i].classList.toggle('is-active', i === current);
      }
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('is-active', j === current);
        dots[j].setAttribute('aria-selected', j === current ? 'true' : 'false');
      }
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function start() {
      if (prefersReducedMotion || slides.length < 2) return;
      stop();
      timer = window.setInterval(function () { if (!paused) next(); }, 8000);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    show(0);
    start();

    var prevBtn = root.querySelector('.hp-banner-prev');
    var nextBtn = root.querySelector('.hp-banner-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });

    for (var d = 0; d < dots.length; d++) {
      (function (idx) {
        dots[idx].addEventListener('click', function () { show(idx); start(); });
      })(d);
    }

    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    root.addEventListener('focusin', function () { paused = true; });
    root.addEventListener('focusout', function () { paused = false; });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  });
})();
