(function () {
  'use strict';

  function buildToc() {
    var article = document.querySelector('main article.prose, main .prose article') ||
                  document.querySelector('main .prose');
    if (!article) return;
    var headings = article.querySelectorAll('h2, h3');
    if (headings.length < 4) return;

    var aside = document.createElement('aside');
    aside.className = 'blog-toc';
    aside.setAttribute('aria-label', 'Table of contents');
    aside.innerHTML = '<div class="blog-toc-label">On this page</div><ol class="blog-toc-list"></ol>';
    var list = aside.querySelector('.blog-toc-list');

    var slug = 0;
    headings.forEach(function (h) {
      if (!h.id) {
        var id = (h.textContent || '').toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim().replace(/\s+/g, '-')
          .slice(0, 60) || ('h-' + (slug++));
        h.id = id;
      }
      var li = document.createElement('li');
      li.className = 'blog-toc-item lvl-' + h.tagName.toLowerCase();
      li.innerHTML = '<a href="#' + h.id + '">' + h.textContent + '</a>';
      list.appendChild(li);
    });

    document.body.appendChild(aside);

    if ('IntersectionObserver' in window) {
      var links = aside.querySelectorAll('a');
      var byId = {};
      links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var a = byId[e.target.id];
          if (!a) return;
          if (e.isIntersecting) a.classList.add('is-current');
          else a.classList.remove('is-current');
        });
      }, { rootMargin: '-25% 0px -65% 0px' });
      headings.forEach(function (h) { io.observe(h); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToc);
  } else { buildToc(); }
})();
