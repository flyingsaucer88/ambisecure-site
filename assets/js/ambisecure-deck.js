/* AmbiSecure deck slideshow controller.
 * Progressive enhancement: with no JS, every slide is shown stacked (and the
 * page still carries the full transcript + PDF download). When this script
 * runs it turns the stack into a single-slide carousel with prev/next,
 * keyboard navigation, a live slide counter, and neighbour preloading.
 * CSP: loaded as an external file (script-src 'self'); no inline handlers.
 */
(function () {
  'use strict';

  function init() {
    var deck = document.getElementById('deck');
    if (!deck) return;

    var slides = Array.prototype.slice.call(deck.querySelectorAll('.deck-slide'));
    var total = slides.length;
    if (total === 0) return;

    var prevBtn = deck.querySelector('.deck-prev');
    var nextBtn = deck.querySelector('.deck-next');
    var curEl = deck.querySelector('.deck-cur');
    var live = deck.querySelector('.deck-live');
    var fill = deck.querySelector('.deck-progress-fill');
    var current = 0;

    // Swap a slide's data-src into src (lazy) — used for the active slide and
    // its immediate neighbours so navigation never shows a blank frame.
    function load(i) {
      if (i < 0 || i >= total) return;
      var img = slides[i].querySelector('img');
      if (img && img.dataset && img.dataset.src && !img.getAttribute('src')) {
        img.setAttribute('src', img.dataset.src);
      }
    }

    function show(i) {
      if (i < 0) i = 0;
      if (i > total - 1) i = total - 1;
      current = i;
      for (var s = 0; s < total; s++) {
        var active = s === i;
        slides[s].classList.toggle('is-active', active);
        slides[s].setAttribute('aria-hidden', active ? 'false' : 'true');
      }
      load(i);
      load(i - 1);
      load(i + 1);
      if (curEl) curEl.textContent = String(i + 1);
      if (prevBtn) prevBtn.disabled = i === 0;
      if (nextBtn) nextBtn.disabled = i === total - 1;
      if (fill) fill.style.width = ((i + 1) / total * 100) + '%';
      if (live) live.textContent = 'Slide ' + (i + 1) + ' of ' + total;
    }

    function go(delta) { show(current + delta); }

    // Enhance: hide the no-JS stacked layout and reveal the controls.
    deck.classList.add('is-enhanced');
    var controls = deck.querySelector('.deck-controls');
    if (controls) controls.hidden = false;

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      else if (e.key === 'Home') { show(0); e.preventDefault(); }
      else if (e.key === 'End') { show(total - 1); e.preventDefault(); }
    });

    show(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
