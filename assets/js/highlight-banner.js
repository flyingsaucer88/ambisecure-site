/**
 * Homepage highlight / banner system.
 *
 * Pulls a JS-defined configuration (window.AS_HOMEPAGE_BANNERS) and renders
 * the first ENABLED entry into any element with class .hp-banner-slot.
 * Designed so editors can rotate banners by editing one file
 * (/assets/js/highlight-banner-config.js) without touching templates.
 *
 * Banner shape:
 *   {
 *     id:          "string",
 *     enabled:     true,
 *     eyebrow:     "FEATURED · OnePass platform",
 *     title:       "Hardware-rooted identity, ready for procurement.",
 *     body:        "Short body copy.",
 *     accent:      "red" | "cyan" | "dark",
 *     primaryCta:  { label: "View OnePass", url: "/products/onepass-card/" },
 *     secondaryCta:{ label: "Talk to engineering", url: "/contact/" }, // optional
 *     startsAt:    "2026-01-01T00:00:00Z", // optional, banner activates at this time
 *     endsAt:      "2026-12-31T23:59:59Z", // optional, banner expires after this
 *   }
 *
 * Pick rule:
 *   - First entry where enabled===true AND now is within startsAt..endsAt (if set).
 *   - If multiple match, the FIRST one wins. Reorder the array to change.
 *
 * Zero network calls. Zero localStorage. CSP-safe.
 */
(function () {
  var slots = document.querySelectorAll(".hp-banner-slot");
  if (!slots.length) return;
  if (!window.AS_HOMEPAGE_BANNERS || !Array.isArray(window.AS_HOMEPAGE_BANNERS)) return;

  var now = Date.now();
  var pick = null;
  for (var i = 0; i < window.AS_HOMEPAGE_BANNERS.length; i++) {
    var b = window.AS_HOMEPAGE_BANNERS[i];
    if (!b || !b.enabled) continue;
    if (b.startsAt && now < new Date(b.startsAt).getTime()) continue;
    if (b.endsAt && now > new Date(b.endsAt).getTime()) continue;
    pick = b;
    break;
  }
  if (!pick) {
    // No active banner: hide the slot so it doesn't leave empty space.
    slots.forEach(function (s) { s.style.display = "none"; });
    return;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];
    });
  }

  var accent = pick.accent === "cyan" ? "var(--secure-cyan,#0E8C9C)"
             : pick.accent === "dark" ? "var(--ink,#3A3F40)"
             : "var(--brand-red,#E3222A)";

  var secondaryCta = "";
  if (pick.secondaryCta && pick.secondaryCta.url) {
    secondaryCta = '<a href="' + esc(pick.secondaryCta.url) + '" class="btn btn-outline">' + esc(pick.secondaryCta.label) + '</a>';
  }

  var html = ''
    + '<div class="hp-banner" style="background:linear-gradient(135deg,#FFFFFF 0%,#F4F5F6 100%);border:1px solid var(--rule);border-left:4px solid ' + accent + ';border-radius:8px;padding:28px 32px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;">'
    +   '<div style="flex:1 1 480px;min-width:0;">'
    +     '<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;font-weight:600;letter-spacing:0.5px;color:' + accent + ';text-transform:uppercase;margin-bottom:6px;">' + esc(pick.eyebrow || "Featured") + '</div>'
    +     '<h2 style="font-family:\'Montserrat\',sans-serif;font-size:24px;font-weight:700;color:var(--ink);margin:0 0 8px 0;line-height:1.25;">' + esc(pick.title) + '</h2>'
    +     '<p style="margin:0;color:var(--brand-grey);font-size:15px;line-height:1.65;">' + esc(pick.body) + '</p>'
    +   '</div>'
    +   '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">'
    +     '<a href="' + esc(pick.primaryCta.url) + '" class="btn btn-primary">' + esc(pick.primaryCta.label) + '</a>'
    +     secondaryCta
    +   '</div>'
    + '</div>';

  slots.forEach(function (s) { s.innerHTML = html; });
})();
