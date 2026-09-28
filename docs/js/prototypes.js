/* ==========================================================================
   prototypes.js — Smart Energy GB prototype behaviour (V1)

   Driven by ids and data attributes on the pages. Shared records
   (suppliers, price cap, figures, answers) come from data.js, so every page
   reads the same facts. Generic patterns (accordions, tabs, carousels,
   modals, notes switch, prototype navigator) live in wireframe.js.
   ========================================================================== */

(function () {
  'use strict';

  var SUPPLIERS = window.SEGB_SUPPLIERS || [];
  var BIZ = window.SEGB_BUSINESS_SUPPLIERS || [];
  var CAP = window.SEGB_PRICE_CAP || { periods: [] };
  var ANSWERS = window.SEGB_ANSWERS || [];
  var TOPICS = window.SEGB_TOPICS || [];
  /* The date the prototypes treat as "today" when the real date falls
     outside the sample price data, so the pack still demonstrates later. */
  var PROTO_TODAY = '2026-09-28';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
  function pence(n) { return n.toFixed(2) + 'p'; }
  function setText(sel, txt, root) { $all(sel, root).forEach(function (el) { el.textContent = txt; }); }

  /* --- Query parameters (?supplier=, ?q=, ?start=) ------------------------
     Some hosts strip the query string, so the last clicked link's query is
     also kept in sessionStorage for the page it points to. */
  function currentFile() { return (window.location.pathname.split('/').pop() || 'index.html'); }
  function param(name) {
    var v = null;
    try { v = new URLSearchParams(window.location.search).get(name); } catch (e) { v = null; }
    if (v) return v;
    try {
      var saved = JSON.parse(window.sessionStorage.getItem('segb-q') || 'null');
      if (saved && saved.file === currentFile()) return new URLSearchParams(saved.q).get(name);
    } catch (e) { /* private mode */ }
    return null;
  }
  function rememberQuery(href) {
    try {
      if (href.indexOf('?') !== -1) window.sessionStorage.setItem('segb-q', JSON.stringify({ file: href.split('?')[0].split('/').pop(), q: href.split('?')[1].split('#')[0] }));
      else if (href.charAt(0) !== '#') window.sessionStorage.removeItem('segb-q');
    } catch (err) { /* private mode */ }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) rememberQuery(a.getAttribute('href'));
  }, true);

  /* --- Toast and copy ---------------------------------------------------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#wf-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'wf-toast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { t.hidden = true; }, 2800);
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.className = 'visually-hidden';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      toast(ok ? done : 'Select the text and press Ctrl+C to copy');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(done); }, fallback);
    } else fallback();
  }

  /* --- Shared form validation ------------------------------------------- */
  function validateForm(form) {
    var first = null;
    $all('[required]', form).forEach(function (input) {
      var field = input.closest('.field') || input.closest('fieldset');
      var ok = input.type === 'email' ? /.+@.+\..+/.test(input.value)
        : input.type === 'checkbox' ? input.checked
        : input.value.trim() !== '';
      if (field) {
        field.classList.toggle('has-error', !ok);
        var err = $('.field-error', field);
        if (err) err.hidden = ok;
      }
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !first) first = input;
    });
    if (first) { first.focus(); return false; }
    return true;
  }

  /* --- Segmented controls (a radio group shown as a switch) -------------- */
  function initSeg() {
    $all('.seg').forEach(function (group) {
      var buttons = $all('[role="radio"]', group);
      var hasChecked = !!$('[aria-checked="true"]', group);
      buttons.forEach(function (b, i) {
        b.setAttribute('tabindex', b.getAttribute('aria-checked') === 'true' || (i === 0 && !hasChecked) ? '0' : '-1');
        b.addEventListener('click', function () { select(b); });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var n = buttons[(i + d + buttons.length) % buttons.length];
          n.focus(); select(n);
        });
      });
      function select(b) {
        buttons.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.setAttribute('tabindex', x === b ? '0' : '-1'); });
        group.dispatchEvent(new CustomEvent('segchange', { detail: b }));
      }
    });
  }

  /* --- Supplier finder (R12, R13, R40) ---------------------------------- */
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9& ]/g, '').replace(/\s+/g, ' ').trim(); }
  function supplierById(id) {
    var all = SUPPLIERS.concat(BIZ);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function matchSuppliers(list, q) {
    q = norm(q);
    if (!q) return [];
    var starts = [], contains = [];
    list.forEach(function (s) {
      var hay = norm(s.name + ' ' + (s.alt || ''));
      if (norm(s.name).indexOf(q) === 0 || hay.split(' ').some(function (w) { return w.indexOf(q) === 0; })) starts.push(s);
      else if (hay.indexOf(q) !== -1) contains.push(s);
    });
    return starts.concat(contains).slice(0, 6);
  }

  function initFinders() {
    $all('[data-finder]').forEach(function (finder) {
      var input = $('input', finder);
      var list = $('.finder-list', finder);
      var status = $('.finder-status', finder);
      var handover = $('[data-handover]', finder);
      var linkMode = finder.hasAttribute('data-finder-link');
      var source = SUPPLIERS;
      var options = [];
      var active = -1;

      function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
      function render() {
        var matches = matchSuppliers(source, input.value);
        options = matches.slice();
        if (input.value.trim()) options.push({ id: '__none', name: "Can't see your supplier?" });
        list.innerHTML = options.map(function (s, i) {
          var note = s.now ? '<span class="opt-note"> · now ' + esc(supplierById(s.now).name) + '</span>' : '';
          return '<li role="option" id="' + input.id + '-opt-' + i + '" data-i="' + i + '" aria-selected="false"' + (s.id === '__none' ? ' class="none"' : '') + '>' + esc(s.name) + note + '</li>';
        }).join('');
        list.hidden = !options.length;
        input.setAttribute('aria-expanded', options.length ? 'true' : 'false');
        status.textContent = input.value.trim() ? (matches.length === 1 ? '1 supplier found.' : matches.length + ' suppliers found.') : '';
        active = -1;
      }
      function highlight(i) {
        $all('[role="option"]', list).forEach(function (o, j) { o.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
        active = i;
        if (i >= 0) input.setAttribute('aria-activedescendant', input.id + '-opt-' + i);
      }
      function choose(i) {
        var s = options[i];
        if (!s) return;
        close();
        if (s.id === '__none') {
          input.value = '';
          status.textContent = "Your supplier's name and phone number are on your energy bill. Contact them and ask for a smart meter.";
          if (handover) handover.hidden = true;
          return;
        }
        input.value = s.name;
        if (linkMode) {
          var href = 'get-a-smart-meter.html?supplier=' + encodeURIComponent(s.id);
          rememberQuery(href);
          window.location.href = href;
          return;
        }
        showHandover(s);
      }
      function showHandover(s) {
        if (!handover) return;
        var target = s.now ? supplierById(s.now) : s;
        setText('[data-handover-name]', target.name);
        var moved = $('[data-handover-moved]', handover);
        if (s.now) { moved.hidden = false; moved.textContent = s.name + ' customers are now looked after by ' + target.name + '.'; }
        else moved.hidden = true;
        handover.hidden = false;
        handover.focus();
        window.segbChosen = target.name;
      }

      input.addEventListener('input', render);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); highlight(Math.min(active + 1, options.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(active - 1, 0)); }
        else if (e.key === 'Enter') { if (!list.hidden) { e.preventDefault(); choose(active >= 0 ? active : 0); } }
        else if (e.key === 'Escape') { close(); }
      });
      list.addEventListener('mousedown', function (e) { e.preventDefault(); });
      list.addEventListener('click', function (e) { var li = e.target.closest('[role="option"]'); if (li) choose(parseInt(li.getAttribute('data-i'), 10)); });
      input.addEventListener('blur', function () { window.setTimeout(close, 150); });

      var go = $('[data-handover-go]', finder);
      if (go) go.addEventListener('click', function (e) { e.preventDefault(); toast('On the live site this opens ' + (window.segbChosen || 'the supplier') + "'s smart meter booking page"); });
      var reset = $('[data-finder-reset]', finder);
      if (reset) reset.addEventListener('click', function () { handover.hidden = true; input.value = ''; status.textContent = ''; input.focus(); });

      /* Home / small business switch (R10) */
      var modeGroup = $('[data-finder-mode]');
      if (modeGroup && !linkMode) {
        modeGroup.addEventListener('segchange', function (e) {
          var biz = e.detail.getAttribute('data-mode') === 'business';
          source = biz ? BIZ : SUPPLIERS;
          setText('[data-finder-label]', biz ? "Who supplies your business's energy?" : "Who supplies your home's energy?");
          input.value = ''; status.textContent = ''; if (handover) handover.hidden = true; close();
        });
      }

      /* Arriving from the homepage with a supplier already chosen */
      var pre = !linkMode && param('supplier');
      if (pre && supplierById(pre)) { var s = supplierById(pre); input.value = s.name; showHandover(s); }
    });
  }

  /* --- Checklist, links and reminder (R15, R16, R48) --------------------- */
  function initCopies() {
    var cl = $('[data-copy-checklist]');
    if (cl) cl.addEventListener('click', function () {
      var items = $all('#checklist-items li').map(function (li) { return '- ' + li.textContent; });
      copyText('Smart meter installation: get-ready checklist\n' + items.join('\n'), 'Checklist copied');
    });
    var cp = $('[data-copy-link]');
    if (cp) cp.addEventListener('click', function () { copyText(window.location.href.split('?')[0], 'Link copied'); });
  }
  function initRemind() {
    var f = $('#remind-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(f)) return;
      f.hidden = true;
      var done = $('#remind-done');
      done.hidden = false;
      setText('[data-remind-email]', $('#remind-email').value);
      setText('[data-remind-when]', $('#remind-when').value.toLowerCase());
      if (!window.segbChosen) setText('[data-handover-name]', 'your supplier', done);
      $('h2', done).focus();
    });
  }

  /* --- Which meter do I have? (R17) -------------------------------------- */
  var METERS = {
    smart: { t: 'You have a smart meter', p: "If your in-home display is working and your bills aren't estimated, there's nothing you need to do.", a: ['is-my-meter-working.html', 'Check your smart meter is working'] },
    older: { t: 'You have an older smart meter', p: 'Your supplier may get in touch to switch up some of the equipment so it stays connected. It is at no extra cost.', a: ['switch-up.html', 'Find out about the switch up'] },
    prepay: { t: 'You have a traditional prepay meter', p: 'A prepay smart meter lets you top up online, by app or by phone, and see your balance at a glance.', a: ['get-a-smart-meter.html', 'Get a prepay smart meter'] },
    traditional: { t: "You don't have a smart meter yet", p: 'You can get one at no extra cost from your energy supplier. It takes three steps.', a: ['get-a-smart-meter.html', 'Get a smart meter'] },
    rts: { t: 'Contact your supplier to replace it now', p: 'The signal that controls radio teleswitch meters has been switched off, so heating and hot water may not come on when they should. Your supplier will replace it with a smart meter.', a: ['is-my-meter-working.html?start=rts', 'What to do about an RTS meter'] },
    unsure: { t: 'Your supplier can tell you', p: 'Contact your energy supplier using the number on your bill. They can tell you what meter you have and whether you can get a smart meter.', a: ['get-a-smart-meter.html', 'Find your supplier'] }
  };
  function initMeterPicker() {
    var group = $('[data-meter-picker]');
    if (!group) return;
    var out = $('[data-meter-result]');
    var opts = $all('.meter-opt', group);
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        opts.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
        var m = METERS[b.getAttribute('data-meter')];
        out.innerHTML = '<h2>' + esc(m.t) + '</h2><p>' + esc(m.p) + '</p><a class="btn" href="' + m.a[0] + '">' + esc(m.a[1]) + '</a>';
        out.focus();
      });
    });
  }

  /* --- Guided checker (R20–R23) ------------------------------------------ */
  var TREE = {
    start: { q: "What's happening?", o: [
      ['My in-home display is blank or not updating', 'display'],
      ['My bills are estimated, or my supplier keeps asking for readings', 'estimated'],
      ['My supplier wants to replace my smart meter or its hub', 'R:switchup'],
      ['My heating or hot water comes on at the wrong times', 'rts'],
      ["I've no gas or electricity at all", 'R:nosupply']] },
    display: { q: 'Is the display plugged in, and near your meter?', o: [['Yes', 'display2'], ["No, or I'm not sure", 'R:power']] },
    display2: { q: 'Have you switched supplier or moved home in the last few months?', o: [['Yes', 'R:pair'], ['No', 'R:display-contact']] },
    estimated: { q: 'When was your smart meter installed?', o: [['In the last month', 'R:first-weeks'], ['More than a month ago', 'estimated2']] },
    estimated2: { q: 'Have you switched supplier in the last few months?', o: [['Yes', 'R:switched'], ['No', 'R:traditional']] },
    rts: { q: 'Do your storage heaters or hot water switch on by themselves at set times?', o: [['Yes', 'R:rts'], ['No', 'R:general']] }
  };
  var RESULTS = {
    power: { k: 'try', t: 'Try reconnecting your display', b: ['Plug the display in at a socket near your meter.', 'Switch it off and on again.', 'Give it up to an hour to reconnect.'], n: 'Still blank after an hour? Contact your supplier. They can reconnect it or send you a new one.', contact: true },
    pair: { k: 'contact', t: 'Your display may need reconnecting by your new supplier', b: ['When you switch supplier or move home, the display sometimes needs to be joined up again.', 'Your supplier can usually do this without a visit.'], contact: true },
    'display-contact': { k: 'contact', t: 'Contact your supplier about your display', b: ['Your meter may still be working normally. The display itself may have a fault.', 'Your supplier can check the connection or replace the display.'], contact: true },
    'first-weeks': { k: 'wait', t: 'Nothing to worry about yet', b: ['It can take a couple of weeks for your supplier to start getting readings from a new meter.', 'If they ask for a reading in the meantime, you can send one.'], n: 'Still estimated after a month? Come back and choose "More than a month ago".', link: ['#first-weeks', 'What happens in the first weeks'] },
    switched: { k: 'contact', t: 'Your new supplier may need to connect to your meter', b: ['Some meters need extra steps before a new supplier can read them.', 'Ask your new supplier to check your meter is working in smart mode.'], contact: true },
    traditional: { k: 'contact', t: 'Your meter may not be sending readings', b: ["Your smart meter may be working in 'traditional mode': it records your use but doesn't send readings.", 'Your supplier can check and fix this, often without a visit.', 'Until then, send regular readings so your bills are accurate.'], contact: true, link: ['answers.html?q=reading', 'How to read your smart meter'] },
    switchup: { k: 'good', t: 'Say yes to the switch up', b: ['Some older smart meter equipment uses 2G and 3G networks that are being switched off.', 'Your supplier is replacing it so your meter keeps sending readings. It is at no extra cost.'], link: ['switch-up.html', 'Find out about the switch up'] },
    rts: { k: 'act', t: 'Contact your supplier to replace your meter now', b: ['You may have a Radio Teleswitch (RTS) meter. The signal that controls these has been switched off, so heating and hot water may come on at the wrong times.', 'Your supplier will replace it with a smart meter at no extra cost.'], contact: true },
    general: { k: 'contact', t: 'Contact your supplier', b: ["It doesn't sound like a meter problem, but your supplier can check your meter and tariff for you."], contact: true },
    nosupply: { k: 'urgent', t: 'Check for a power cut or gas emergency first', b: ['If your neighbours have also lost power, call 105 to report a power cut.', 'If you smell gas, call the gas emergency number: 0800 111 999.', "If you're on prepay, check your credit and emergency credit."], n: 'If none of these apply, contact your supplier straight away.', contact: true }
  };
  var KIND = { try: 'Try this first', contact: 'Contact your supplier', wait: 'Nothing to worry about yet', good: 'Good to know', act: 'Act now', urgent: 'Urgent' };

  function initChecker() {
    var app = $('[data-checker]');
    if (!app) return;
    var stage = $('[data-checker-stage]', app);
    var trail = $('[data-checker-trail]', app);
    var restart = $('[data-checker-restart]', app);
    var path = [];

    function renderTrail() {
      trail.innerHTML = path.map(function (p, i) {
        return '<li><button type="button" class="btn-link" data-back="' + i + '" aria-label="Change answer: ' + esc(p.a) + '">' + esc(p.a) + '</button></li>';
      }).join('');
      trail.hidden = !path.length;
      restart.hidden = !path.length;
    }
    function showNode(id, focus) {
      if (id.indexOf('R:') === 0) { showResult(id.slice(2), focus); return; }
      var n = TREE[id];
      stage.innerHTML = '<fieldset class="checker-q"><legend>' + esc(n.q) + '</legend><div class="checker-opts">' +
        n.o.map(function (o) { return '<button type="button" class="checker-opt" data-next="' + o[1] + '">' + esc(o[0]) + '</button>'; }).join('') +
        '</div></fieldset>';
      $all('.checker-opt', stage).forEach(function (b) {
        b.addEventListener('click', function () {
          path.push({ node: id, a: b.textContent });
          renderTrail();
          showNode(b.getAttribute('data-next'), true);
        });
      });
      if (focus) stage.focus();
    }
    function showResult(key, focus) {
      var r = RESULTS[key];
      var html = '<div class="result-card kind-' + r.k + '"><span class="badge solid">' + KIND[r.k] + '</span><h3>' + esc(r.t) + '</h3><ul>' +
        r.b.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      if (r.n) html += '<p>' + esc(r.n) + '</p>';
      if (r.link) html += '<p><a href="' + r.link[0] + '">' + esc(r.link[1]) + '</a></p>';
      if (r.contact) {
        html += '<div class="contact-box"><label for="ck-supplier">Who is your energy supplier?</label><select id="ck-supplier"><option value="">Choose your supplier</option>' +
          SUPPLIERS.filter(function (s) { return !s.now; }).map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') +
          '</select><div class="contact-out" aria-live="polite"></div></div>';
      }
      html += '</div>';
      stage.innerHTML = html;
      var sel = $('#ck-supplier', stage);
      if (sel) sel.addEventListener('change', function () {
        var s = supplierById(sel.value);
        var out = $('.contact-out', stage);
        if (!s) { out.innerHTML = ''; return; }
        var say = 'I have a smart meter. ' + (path.length ? path[0].a + '. ' : '') + 'Please can you check it is working in smart mode?';
        out.innerHTML = '<p><strong>' + esc(s.name) + '</strong>: phone, web chat and opening hours [from the supplier]. <a href="#">Contact ' + esc(s.name) + '</a></p>' +
          '<div class="say-box"><p class="wf-meta">What to say</p><p>' + esc(say) + '</p><button type="button" class="btn btn-sm btn-secondary" data-copy-say>Copy</button></div>';
        $('[data-copy-say]', out).addEventListener('click', function () { copyText(say, 'Copied'); });
      });
      if (focus) stage.focus();
    }
    trail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-back]');
      if (!b) return;
      var i = parseInt(b.getAttribute('data-back'), 10);
      var node = path[i].node;
      path = path.slice(0, i);
      renderTrail();
      showNode(node, true);
    });
    restart.addEventListener('click', function () { path = []; renderTrail(); showNode('start', true); });
    $all('[data-checker-jump]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        path = [{ node: 'start', a: TREE.start.o[1][0] }];
        renderTrail();
        showNode(a.getAttribute('data-checker-jump'), true);
        app.scrollIntoView({ block: 'start' });
      });
    });

    var start = param('start');
    if (start === 'rts') { path = [{ node: 'start', a: TREE.start.o[3][0] }]; renderTrail(); showNode('rts'); }
    else if (start === 'switchup') { path = [{ node: 'start', a: TREE.start.o[2][0] }]; renderTrail(); showNode('R:switchup'); }
    else { renderTrail(); showNode('start'); }
  }

  /* --- Price cap record (R30, R31, R45) ---------------------------------- */
  function capFor(iso) {
    var now = null, prev = null, next = null;
    CAP.periods.forEach(function (p, i) {
      if (p.from <= iso && iso <= p.to) { now = p; prev = CAP.periods[i - 1] || null; next = CAP.periods[i + 1] || null; }
    });
    return { now: now, prev: prev, next: next };
  }
  function isoToday() {
    var d = new Date();
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return capFor(iso).now ? iso : PROTO_TODAY;
  }
  function longDate(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function shortDate(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); }
  function dayBefore(iso) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - 1); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
  function pct(a, b) { var p = Math.round((b - a) / a * 100); return (p >= 0 ? 'up ' : 'down ') + Math.abs(p) + '%'; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function initCap() {
    var mod = $('[data-cap]');
    var sel = $('[data-preview-date]');
    if (sel && isoToday() >= '2026-10-01') sel.value = '2026-10-01';

    function render() {
      var iso = sel ? sel.value : isoToday();
      var c = capFor(iso);
      if (mod && c.now) {
        setText('[data-cap-now-label]', 'Price cap for ' + c.now.label);
        setText('[data-cap-now-typical]', money(c.now.typical));
        setText('[data-cap-now-change]', c.prev ? cap1(pct(c.prev.typical, c.now.typical)) + ' on ' + c.prev.label + ' (' + money(c.prev.typical) + ').' : '');
        setText('[data-cap-use]', 'For typical use of ' + CAP.typicalUse.elecKwh.toLocaleString('en-GB') + ' kWh of electricity and ' + CAP.typicalUse.gasKwh.toLocaleString('en-GB') + ' kWh of gas a year, paying by direct debit.');
        var nx = $('[data-cap-next]');
        if (c.next) {
          nx.innerHTML = '<p class="eyebrow">Changing on ' + longDate(c.next.from) + '</p><p class="cap-figure">' + money(c.next.typical) + '<small> a year</small></p><p>' + cap1(pct(c.now.typical, c.next.typical)) + ', for ' + c.next.label + '. That\'s in ' + daysBetween(iso, c.next.from) + ' days.</p>';
        } else {
          nx.innerHTML = '<p class="eyebrow">Next change</p><p><strong>Not announced yet.</strong> Ofgem usually announces the next cap about five weeks before it starts. This page updates when it does.</p>';
        }
        setText('[data-cap-col-now]', c.now.label);
        setText('[data-cap-col-next]', c.next ? 'From ' + longDate(c.next.from) : 'Next change');
        var rows = [['Electricity, per kWh', 'elec', 'unit'], ['Electricity standing charge, per day', 'elec', 'standing'], ['Gas, per kWh', 'gas', 'unit'], ['Gas standing charge, per day', 'gas', 'standing']];
        $('[data-cap-rates]').innerHTML = rows.map(function (r) {
          var a = c.now[r[1]] ? pence(c.now[r[1]][r[2]]) : 'n/a';
          var b = c.next && c.next[r[1]] ? pence(c.next[r[1]][r[2]]) : 'Not announced';
          return '<tr><th scope="row">' + r[0] + '</th><td class="num">' + a + '</td><td class="num">' + b + '</td></tr>';
        }).join('');
        var tip = $('[data-reading-tip]');
        var soon = c.next && daysBetween(iso, c.next.from) <= 7;
        tip.hidden = !soon;
        if (soon) tip.innerHTML = '<strong>The price cap changes on ' + longDate(c.next.from) + '.</strong> No smart meter? Send your supplier a meter reading on ' + dayBefore(c.next.from) + ' or ' + shortDate(c.next.from) + ', so you\'re charged the right price for the energy you used before the change. Smart meters send readings automatically.';
      }
      renderEstimate(c);
    }

    var teaser = $('[data-cap-teaser-text]');
    if (teaser) {
      var t = capFor(isoToday());
      teaser.textContent = 'Until ' + longDate(t.now.to) + ', the cap is ' + money(t.now.typical) + ' a year for typical use.' + (t.next ? ' From ' + longDate(t.next.from) + ' it is ' + money(t.next.typical) + ', ' + pct(t.now.typical, t.next.typical) + '.' : '');
    }
    if (sel) sel.addEventListener('change', render);
    if (mod || $('[data-estimator]')) { initEstimator(); render(); }
  }

  /* --- Bill estimator (R33) ---------------------------------------------- */
  var PRESETS = { low: [1800, 7500], typical: [2500, 9500], high: [4100, 15000] };
  var lastCap = null;
  function initEstimator() {
    var box = $('[data-estimator]');
    if (!box) return;
    var e = $('#est-elec'), g = $('#est-gas'), ng = $('#est-nogas');
    [e, g].forEach(function (i) { i.addEventListener('input', function () { renderEstimate(lastCap); }); });
    ng.addEventListener('change', function () { g.disabled = ng.checked; renderEstimate(lastCap); });
    $('.seg', box).addEventListener('segchange', function (ev) {
      var p = PRESETS[ev.detail.getAttribute('data-preset')];
      e.value = p[0]; g.value = p[1];
      renderEstimate(lastCap);
    });
  }
  function costs(p, ek, gk) {
    var r = { eu: ek * p.elec.unit / 100, es: 365 * p.elec.standing / 100, gu: gk * p.gas.unit / 100, gs: gk ? 365 * p.gas.standing / 100 : 0 };
    r.year = r.eu + r.es + r.gu + r.gs;
    return r;
  }
  function renderEstimate(c) {
    var box = $('[data-estimator]');
    if (!box || !c) return;
    lastCap = c;
    var ek = parseInt($('#est-elec').value, 10);
    var gk = $('#est-nogas').checked ? 0 : parseInt($('#est-gas').value, 10);
    setText('[data-est-elec-out]', ek.toLocaleString('en-GB'));
    setText('[data-est-gas-out]', gk.toLocaleString('en-GB'));
    var p = c.now && c.now.elec ? c.now : c.next;
    var r = costs(p, ek, gk);
    setText('[data-est-period]', 'Under the ' + p.label + ' cap');
    setText('[data-est-month]', money(r.year / 12));
    setText('[data-est-e-unit]', money(r.eu)); setText('[data-est-e-sc]', money(r.es));
    setText('[data-est-g-unit]', money(r.gu)); setText('[data-est-g-sc]', money(r.gs));
    setText('[data-est-year]', money(r.year));
    var n = c.next && c.next.elec && p !== c.next ? costs(c.next, ek, gk) : null;
    setText('[data-est-next]', n ? 'From ' + longDate(c.next.from) + ': about ' + money(n.year / 12) + ' a month. An estimate for a direct debit customer on a standard tariff.' : 'An estimate for a direct debit customer on a standard tariff. Your bill depends on your tariff and how you pay.');
  }

  /* --- Peak times clock (R32) -------------------------------------------- */
  function initPeak() {
    var box = $('[data-peak]');
    if (!box) return;
    var clock = $('[data-peak-clock]', box);
    var peak = (window.SEGB_PEAK || {}).weekday || [16, 19];
    var day = 'weekday';
    function pt(cx, cy, r, a) { var t = (a - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
    function arc(r0, r1, a0, a1) {
      var p1 = pt(130, 130, r1, a0), p2 = pt(130, 130, r1, a1), p3 = pt(130, 130, r0, a1), p4 = pt(130, 130, r0, a0);
      return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) +
        ' L' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + p4[0].toFixed(1) + ' ' + p4[1].toFixed(1) + ' Z';
    }
    function draw() {
      var s = '<svg viewBox="0 0 260 260" aria-hidden="true" focusable="false">';
      for (var h = 0; h < 24; h++) {
        var isPeak = day === 'weekday' && h >= peak[0] && h < peak[1];
        s += '<path class="' + (isPeak ? 'seg-peak' : 'seg-off') + '" d="' + arc(66, 104, h * 15 + 0.8, (h + 1) * 15 - 0.8) + '"></path>';
      }
      [[0, 'Midnight'], [6, '6am'], [12, 'Noon'], [18, '6pm']].forEach(function (l) {
        var p = pt(130, 134, 118, l[0] * 15);
        s += '<text class="clock-label" x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="middle">' + l[1] + '</text>';
      });
      s += '<text class="clock-centre" x="130" y="128" text-anchor="middle">' + (day === 'weekday' ? 'Peak' : 'Off-peak') + '</text>';
      s += '<text class="clock-sub" x="130" y="148" text-anchor="middle">' + (day === 'weekday' ? '4pm to 7pm' : 'usually all day') + '</text></svg>';
      clock.innerHTML = s;
      clock.setAttribute('aria-label', day === 'weekday' ? '24-hour clock: peak time is 4pm to 7pm, the rest of the day is off-peak' : '24-hour clock: weekends are usually off-peak all day');
      setText('[data-peak-headline]', day === 'weekday' ? 'Peak time is 4pm to 7pm on weekdays.' : 'Weekends are usually off-peak.');
    }
    $('.seg', box).addEventListener('segchange', function (e) { day = e.detail.getAttribute('data-day'); draw(); });
    var ADVICE = {
      'Washing machine': 'Run it before 4pm or after 7pm on weekdays, or at the weekend. If it has a delay timer, set it to finish in the morning.',
      'Dishwasher': 'Start it after 7pm, or use the delay timer to run it overnight.',
      'Tumble dryer': 'Avoid 4pm to 7pm on weekdays. It uses a lot of electricity, so moving it makes the biggest difference.',
      'Electric car': 'Charge overnight, when demand is lowest. Ask your supplier about tariffs with cheaper night-time rates.'
    };
    var chips = $all('[data-appliance]', box);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        var a = c.getAttribute('data-appliance');
        setText('[data-peak-advice]', a + ': ' + ADVICE[a]);
      });
    });
    draw();
  }

  /* --- National figures (R43) -------------------------------------------- */
  function initFigures() {
    var host = $('[data-figures-list]');
    if (!host || !window.SEGB_FIGURES) return;
    var F = window.SEGB_FIGURES;
    host.innerHTML = F.items.map(function (i) { return '<div class="stat-item"><div class="stat-value">' + esc(i.value) + '</div><div class="stat-description">' + esc(i.label) + '</div></div>'; }).join('');
    setText('[data-figures-source]', 'Source: ' + F.source + ', ' + F.asOf + '. Updated every quarter.');
  }

  /* --- Switch up campaign question (R48) --------------------------------- */
  function initSwitchUp() {
    var box = $('[data-switchup]');
    if (!box) return;
    var out = $('[data-su-answer]', box);
    var A = {
      yes: '<p><strong>Book the appointment they offer.</strong> It\'s at no extra cost and keeps your automatic readings and accurate bills. If you haven\'t booked yet, contact them using the number on your bill.</p>',
      no: '<p><strong>There\'s nothing you need to do right now.</strong> If your supplier contacts you, they\'ll arrange everything.</p>',
      unsure: '<p><strong>Check for letters, emails or texts from your supplier</strong> that mention your smart meter or its "communications hub". If you\'re not sure a message is genuine, call the number on your bill.</p>'
    };
    $('.seg', box).addEventListener('segchange', function (e) { out.innerHTML = A[e.detail.getAttribute('data-su')]; });
  }

  /* --- Find an answer (R50–R54) ------------------------------------------ */
  var STOP = ['a', 'an', 'the', 'i', 'my', 'do', 'does', 'is', 'it', 'to', 'of', 'for', 'can', 'and', 'or', 'in', 'on', 'me', 'need', 'what', 'how', 'why', 'with', 'have', 'if', 'get', 'are', 'will'];
  function searchAnswers(q) {
    var words = norm(q).split(' ').filter(function (w) { return w && STOP.indexOf(w) === -1; });
    if (!words.length) return null;
    return ANSWERS.map(function (a) {
      var head = (a.q + ' ' + a.tags).toLowerCase(), body = a.a.toLowerCase(), s = 0;
      words.forEach(function (w) { if (head.indexOf(w) !== -1) s += 3; else if (body.indexOf(w) !== -1) s += 1; });
      return { a: a, s: s };
    }).filter(function (x) { return x.s > 0; })
      .sort(function (x, y) { return y.s - x.s; })
      .map(function (x) { return x.a; });
  }
  function topicLabel(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i].label; return id; }
  function answerHTML(a) {
    return '<article class="answer" id="a-' + a.id + '"><p class="wf-meta">' + esc(topicLabel(a.topic)) + '</p><h3>' + esc(a.q) + '</h3><p>' + esc(a.a) + '</p>' +
      (a.link ? '<p><a href="' + a.link + '">Read more</a></p>' : '') +
      '<div class="helpful" data-helpful><span>Did this help?</span><button type="button" class="btn btn-sm btn-secondary" data-h="yes">Yes</button><button type="button" class="btn btn-sm btn-secondary" data-h="no">No</button></div></article>';
  }
  function initAnswers() {
    var form = $('[data-answers-form]');
    if (!form) return;
    var input = $('#q', form), suggest = $('#q-suggest', form);
    var list = $('[data-answers-list]'), count = $('[data-answers-count]');
    var chipsHost = $('[data-topic-chips]');
    var topic = 'all', sActive = -1, sItems = [];

    chipsHost.innerHTML = '<button type="button" class="chip" aria-pressed="true" data-topic="all">All topics</button>' +
      TOPICS.map(function (t) { return '<button type="button" class="chip" aria-pressed="false" data-topic="' + t.id + '">' + esc(t.label) + '</button>'; }).join('');
    chipsHost.addEventListener('click', function (e) {
      var c = e.target.closest('[data-topic]'); if (!c) return;
      topic = c.getAttribute('data-topic');
      $all('[data-topic]', chipsHost).forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      run();
    });

    function run(hitId) {
      var q = input.value.trim();
      var res = searchAnswers(q);
      var browsing = res === null;
      var items = (browsing ? ANSWERS.slice() : res).filter(function (a) { return topic === 'all' || a.topic === topic; });
      var tl = topic === 'all' ? '' : ' in ' + topicLabel(topic);
      var hit = hitId && ANSWERS.filter(function (a) { return a.id === hitId; })[0];
      if (hit) {
        /* A picked suggestion: its answer first, then others on the same topic */
        items = [hit].concat(ANSWERS.filter(function (a) { return a.topic === hit.topic && a !== hit; }).slice(0, 3));
        count.textContent = 'The answer to your question, then related answers on ' + topicLabel(hit.topic).toLowerCase() + '.';
      } else if (browsing) count.textContent = 'Showing ' + items.length + ' answers' + tl + '.';
      else if (items.length) count.textContent = items.length + (items.length === 1 ? ' answer' : ' answers') + ' for "' + q + '"' + tl + '.';
      else count.textContent = 'No answers for "' + q + '"' + tl + '. Try different words, or choose a topic.';
      list.innerHTML = items.map(answerHTML).join('');
      $('[data-myths-section]').hidden = !browsing;
      if (hitId) { var el = document.getElementById('a-' + hitId); if (el) el.classList.add('hit'); }
    }
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-h]'); if (!b) return;
      var box = b.closest('[data-helpful]');
      if (b.getAttribute('data-h') === 'yes') { box.innerHTML = '<span role="status">Thanks for letting us know.</span>'; return; }
      var id = 'fb-' + Math.random().toString(36).slice(2, 7);
      box.innerHTML = '<form class="fb-form"><label for="' + id + '">What were you looking for?</label><input id="' + id + '" type="text"><button type="submit" class="btn btn-sm">Send</button></form>';
      var f = $('form', box); $('input', f).focus();
      f.addEventListener('submit', function (ev) { ev.preventDefault(); box.innerHTML = '<span role="status">Thanks. We read every comment.</span>'; });
    });

    function closeSuggest() { suggest.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); sActive = -1; }
    function renderSuggest() {
      sItems = (searchAnswers(input.value) || []).slice(0, 5);
      suggest.innerHTML = sItems.map(function (a, i) { return '<li role="option" id="q-opt-' + i + '" data-i="' + i + '" aria-selected="false">' + esc(a.q) + '</li>'; }).join('');
      suggest.hidden = !sItems.length;
      input.setAttribute('aria-expanded', sItems.length ? 'true' : 'false');
      sActive = -1;
    }
    function mark() {
      $all('[role="option"]', suggest).forEach(function (o, j) { o.setAttribute('aria-selected', j === sActive ? 'true' : 'false'); });
      if (sActive >= 0) input.setAttribute('aria-activedescendant', 'q-opt-' + sActive);
    }
    function pick(i) { var a = sItems[i]; if (!a) return; input.value = a.q; closeSuggest(); run(a.id); }
    input.addEventListener('input', renderSuggest);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sActive = Math.min(sActive + 1, sItems.length - 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sActive = Math.max(sActive - 1, 0); mark(); }
      else if (e.key === 'Enter' && !suggest.hidden && sActive >= 0) { e.preventDefault(); pick(sActive); }
      else if (e.key === 'Escape') closeSuggest();
    });
    suggest.addEventListener('mousedown', function (e) { e.preventDefault(); });
    suggest.addEventListener('click', function (e) { var li = e.target.closest('[role="option"]'); if (li) pick(parseInt(li.getAttribute('data-i'), 10)); });
    input.addEventListener('blur', function () { window.setTimeout(closeSuggest, 150); });
    form.addEventListener('submit', function (e) { e.preventDefault(); closeSuggest(); run(); });

    $('[data-myths]').innerHTML = ANSWERS.filter(function (a) { return a.myth; }).map(function (a) {
      return '<div class="myth-card"><p class="myth"><span class="badge">Myth</span> ' + esc(a.myth) + '</p><p class="fact"><span class="badge solid">Fact</span> ' + esc(a.a) + '</p></div>';
    }).join('');

    var q0 = param('q');
    if (q0) input.value = q0;
    run();
  }
  /* Homepage search: keep the query for hosts that strip it */
  function initSearchGo() {
    var f = $('[data-search-go]');
    if (!f) return;
    f.addEventListener('submit', function () { rememberQuery('answers.html?q=' + encodeURIComponent($('input', f).value)); });
  }

  /* --- Dead links: say so, rather than jumping to the top ---------------- */
  function initDeadLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#"]');
      if (!a || a.hasAttribute('data-handover-go')) return;
      e.preventDefault();
      toast('Not part of these prototypes');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSeg();
    initFinders();
    initCopies();
    initRemind();
    initMeterPicker();
    initChecker();
    initCap();
    initPeak();
    initFigures();
    initSwitchUp();
    initAnswers();
    initSearchGo();
    initDeadLinks();
  });
})();
