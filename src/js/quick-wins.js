/* ==========================================================================
   quick-wins.js — the quick wins tab (V4)

   Before and after switch on each quick win page, and a shortlist kept in
   this browser (localStorage) that the overview lists and can copy.
   No estimates are shown anywhere in this tab, by design.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'segb-qw-shortlist';
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function track(name, params) { if (window.segbTrack) window.segbTrack(name, params || {}); }
  function slugOfPage() { return (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index'; }

  /* --- Shortlist store --------------------------------------------------- */
  function load() {
    try {
      var v = JSON.parse(window.localStorage.getItem(KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return memory.slice(); }
  }
  var memory = [];
  function save(list) {
    memory = list.slice();
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode: keep in memory */ }
  }
  function has(slug) { return load().indexOf(slug) !== -1; }
  function toggle(slug) {
    var list = load();
    var i = list.indexOf(slug);
    if (i === -1) { list.push(slug); track('qw_shortlist_add', { quick_win: slug }); }
    else { list.splice(i, 1); track('qw_shortlist_remove', { quick_win: slug }); }
    save(list);
    render();
  }

  /* --- Rendering --------------------------------------------------------- */
  function render() {
    var list = load();
    $all('[data-shortlist]').forEach(function (b) {
      var on = list.indexOf(b.getAttribute('data-shortlist')) !== -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'On your shortlist' : 'Add to shortlist';
      var card = b.closest('.qw-card');
      if (card) card.classList.toggle('is-picked', on);
    });
    $all('[data-shortlist-count]').forEach(function (a) {
      a.textContent = list.length ? 'Your shortlist (' + list.length + ')' : 'Your shortlist';
    });
    var panel = $('[data-shortlist-panel]');
    if (!panel) return;
    var cards = {};
    $all('.qw-card[data-qw]').forEach(function (c) { cards[c.getAttribute('data-qw')] = c; });
    var picked = list.filter(function (s) { return cards[s]; })
      .sort(function (a, b) { return +cards[a].getAttribute('data-qw-n') - +cards[b].getAttribute('data-qw-n'); });
    $('[data-shortlist-total]', panel).textContent = picked.length;
    $('[data-shortlist-empty]', panel).hidden = picked.length > 0;
    $('[data-shortlist-tools]', panel).hidden = picked.length === 0;
    var ol = $('[data-shortlist-list]', panel);
    ol.innerHTML = '';
    picked.forEach(function (s) {
      var c = cards[s];
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = $('h3 a', c).getAttribute('href');
      a.innerHTML = '<span class="qw-n">' + c.getAttribute('data-qw-n') + '</span>';
      a.appendChild(document.createTextNode(c.getAttribute('data-qw-title')));
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'qw-remove';
      rm.setAttribute('aria-label', 'Remove ' + c.getAttribute('data-qw-title'));
      rm.innerHTML = '&times;';
      rm.addEventListener('click', function () { toggle(s); var next = $('[data-shortlist-list] .qw-remove') || $('[data-shortlist-empty]'); if (next && next.focus) next.focus(); });
      li.appendChild(a);
      li.appendChild(rm);
      ol.appendChild(li);
    });
  }

  function copyList() {
    var panel = $('[data-shortlist-panel]');
    var lines = $all('[data-shortlist-list] li a', panel).map(function (a) {
      var n = $('.qw-n', a).textContent;
      return n + '. ' + a.textContent.slice(n.length);
    });
    var text = 'Smart Energy GB quick wins shortlist\n' + lines.join('\n');
    var status = $('[data-shortlist-status]', panel);
    function done(ok) { status.textContent = ok ? 'Copied ' + lines.length + (lines.length === 1 ? ' quick win.' : ' quick wins.') : 'Couldn\'t copy. Select the list and copy it instead.'; }
    track('qw_shortlist_copy', { count: lines.length });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
    } else done(fallback(text));
  }
  function fallback(text) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(t);
    return ok;
  }

  /* --- Before and after -------------------------------------------------- */
  function initBeforeAfter() {
    $all('[data-ba]').forEach(function (box) {
      var panes = $('.ba-panes', box);
      var seg = $('.seg', box);
      function show(mode) {
        panes.setAttribute('data-ba-mode', mode);
        $all('[data-ba-pane]', panes).forEach(function (p) {
          var k = p.getAttribute('data-ba-pane');
          p.hidden = !(mode === 'both' || mode === k);
        });
      }
      show($('[aria-checked="true"]', seg).getAttribute('data-ba-show'));
      seg.addEventListener('segchange', function (e) {
        var mode = e.detail.getAttribute('data-ba-show');
        show(mode);
        track('qw_view', { quick_win: slugOfPage(), view: mode });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBeforeAfter();
    $all('[data-shortlist]').forEach(function (b) {
      b.addEventListener('click', function () { toggle(b.getAttribute('data-shortlist')); });
    });
    var panel = $('[data-shortlist-panel]');
    if (panel) {
      $('[data-shortlist-copy]', panel).addEventListener('click', copyList);
      $('[data-shortlist-clear]', panel).addEventListener('click', function () {
        save([]); render(); track('qw_shortlist_clear', {});
        $('[data-shortlist-status]', panel).textContent = 'Shortlist cleared.';
      });
    }
    if (document.body.classList.contains('qw-page')) track('qw_open', { quick_win: slugOfPage() });
    render();
  });
})();
