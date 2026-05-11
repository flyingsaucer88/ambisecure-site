/**
 * Homepage daily blog spotlight rotation.
 *
 * Picks N blogs from window.AS_BLOG_POOL using a deterministic seed derived
 * from today's UTC date. The same set is shown to every visitor for a full
 * UTC day, then rotates at 00:00 UTC the next morning.
 *
 * Requirements:
 *   - /assets/js/blog-pool.js must load first (defines window.AS_BLOG_POOL)
 *   - Mount points (any of these classes will receive content):
 *       .hp-spotlight-featured  -> 3 mixed-era featured posts
 *       .hp-spotlight-modern    -> 3 modern-only posts
 *       .hp-spotlight-archive   -> 1 historical-archive spotlight
 *
 * Zero network calls. Zero localStorage. Zero CSP impact.
 */
(function () {
  if (!window.AS_BLOG_POOL || !Array.isArray(window.AS_BLOG_POOL)) return;
  var pool = window.AS_BLOG_POOL;
  if (pool.length === 0) return;

  // Deterministic daily seed: days since unix epoch, in UTC.
  var now = new Date();
  var utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  var seed = Math.floor(utcMidnight / 86400000);

  // Linear-congruential-ish pseudo-random offset generator.
  function picker(s, len) {
    var i = ((s % len) + len) % len;
    return function () {
      var v = i;
      i = (i * 1103515245 + 12345) & 0x7fffffff;
      i = i % len;
      return v;
    };
  }

  function pickN(arr, n, s) {
    if (arr.length === 0) return [];
    var p = picker(s, arr.length);
    var seen = {};
    var out = [];
    var attempts = 0;
    while (out.length < n && attempts < arr.length * 4) {
      var idx = p();
      if (!seen[idx]) {
        seen[idx] = true;
        out.push(arr[idx]);
      }
      attempts++;
    }
    return out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];
    });
  }

  function renderCard(p, opts) {
    opts = opts || {};
    var badge = "";
    if (opts.showBadge && p.type === "archive") {
      badge = '<span style="background:#FFF6E5;color:#7A4A00;border:1px solid #F0C040;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-right:8px;">ARCHIVE</span>';
    }
    var cats = (p.categories || []).slice(0, 2).map(escapeHTML).join(" &middot; ");
    return (
      '<a href="' + escapeHTML(p.url) + '" class="card">'
      + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:var(--brand-grey);margin-bottom:6px;">' + badge + escapeHTML(p.date) + '</div>'
      + '<h3>' + escapeHTML(p.title) + '</h3>'
      + '<p>' + escapeHTML(p.summary || "") + '</p>'
      + '<div class="card-meta">' + (p.type === "archive" ? "Open archive" : "Read article") + ' &rarr; <span style="opacity:0.55;font-size:11.5px;">' + cats + '</span></div>'
      + '</a>'
    );
  }

  function mount(selector, items, opts) {
    var nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;
    var html = items.map(function (p) { return renderCard(p, opts); }).join("");
    nodes.forEach(function (n) { n.innerHTML = html; });
  }

  // Filter pools
  var modern = pool.filter(function (p) { return p.type === "modern"; });
  var archive = pool.filter(function (p) { return p.type === "archive"; });

  // Pick — different seed nudges per slot so they don't collide.
  var featured = pickN(pool, 3, seed);
  var modernPicks = pickN(modern, 3, seed + 7);
  var archivePicks = pickN(archive, 1, seed + 13);

  mount(".hp-spotlight-featured", featured, { showBadge: true });
  mount(".hp-spotlight-modern", modernPicks, { showBadge: false });
  mount(".hp-spotlight-archive", archivePicks, { showBadge: true });
})();
