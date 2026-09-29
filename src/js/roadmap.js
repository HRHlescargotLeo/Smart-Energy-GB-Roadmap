/* ==========================================================================
   roadmap.js — additions from the ClerksWell 2027 roadmap proposal (V3)

   - GA4-style event tracking with a visible event log (Notes on)
   - Guided assistant (non-AI, five questions, fixed routing)
   - "Picked for you" personalisation on the homepage
   - Installation journey checklist (before you book, on the day, after)
   - Real stories filter and "share your story" form
   - Estimated bills simulator
   Loaded after prototypes.js; shares data from data.js.
   ========================================================================== */

(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(window.sessionStorage.getItem(key) || 'null');
      if (val === null) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
    return null;
  }
  function param(name) {
    try { var v = new URLSearchParams(window.location.search).get(name); if (v) return v; } catch (e) { /* old browser */ }
    try {
      var saved = JSON.parse(window.sessionStorage.getItem('segb-q') || 'null');
      var file = window.location.pathname.split('/').pop() || 'index.html';
      if (saved && saved.file === file) return new URLSearchParams(saved.q).get(name);
    } catch (e) { /* private mode */ }
    return null;
  }

  /* --- Tracking (R67) ------------------------------------------------------
     Every meaningful interaction becomes one named event with a few
     parameters, pushed to the dataLayer for GA4. The log in the corner shows
     them while Notes are on, so the tracking plan can be reviewed alongside
     the design. */
  window.dataLayer = window.dataLayer || [];
  var logged = [];
  function renderLog() {
    var box = $('[data-event-log]');
    if (!box) return;
    var notesOn = !document.body.classList.contains('wf-notes-hidden');
    box.hidden = !(notesOn && logged.length);
    $('[data-event-list]', box).innerHTML = logged.slice(-6).reverse().map(function (e) {
      var p = Object.keys(e.params).map(function (k) { return k + ': ' + esc(e.params[k]); }).join(' · ');
      return '<li><code>' + esc(e.name) + '</code>' + (p ? '<span>' + p + '</span>' : '') + '</li>';
    }).join('');
  }
  window.segbTrack = function (name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    logged.push({ name: name, params: params });
    renderLog();
  };
  var track = window.segbTrack;

  /* --- Guided assistant (R64, R65) -----------------------------------------
     Five fixed questions. Each answer is an event; the result routes to
     two or three pages and saves a profile for the homepage. */
  var QUESTIONS = [
    { id: 'meter', q: 'Do you have a smart meter?', o: [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]] },
    { id: 'home', q: 'Who is it for?', o: [['rent', 'A home I rent'], ['own', 'A home I own'], ['family', 'I live with family'], ['business', 'A small business']] },
    { id: 'pay', q: 'How do you pay for your energy?', o: [['dd', 'Direct debit or bill'], ['prepay', 'Prepay, with a key, card or app'], ['unsure', "I'm not sure"]] },
    { id: 'concern', q: "What's on your mind most?", o: [['cost', 'The cost of energy'], ['install', 'What installation involves'], ['safety', 'Whether smart meters are safe'], ['data', 'Who sees my data'], ['broken', "My meter isn't working"]] },
    { id: 'age', q: 'Which age group are you in?', o: [['under35', 'Under 35'], ['35to64', '35 to 64'], ['65plus', '65 or over'], ['skip', "I'd rather not say"]] }
  ];
  var LINKS = {
    get: ['get-a-smart-meter.html', 'Get a smart meter', 'What to do before you book, on the day and after'],
    getBiz: ['get-a-smart-meter.html?mode=business', 'Get a smart meter for your business', 'Find your business energy supplier'],
    which: ['which-meter.html', 'Check which meter you have', 'Compare your meter with the common types'],
    working: ['is-my-meter-working.html', 'Is my smart meter working?', 'A quick checker with a clear next step'],
    prices: ['energy-prices.html', 'Energy prices and peak times', 'The price cap now, and a simple bill estimate'],
    bills: ['bills.html', 'What does an estimated bill cost?', 'See how a catch-up bill builds up'],
    safety: ['answers.html?topic=safety', 'Safety and your data', 'Straight answers to the common worries'],
    data: ['answers.html?q=data', 'Who can see my energy data?', 'What your supplier sees, and what you choose'],
    renter: ['stories.html?persona=renter', 'Stories from renters', 'People who rent and had one fitted'],
    older: ['stories.html?persona=older', 'Stories from older owners', 'People who had the same questions'],
    younger: ['stories.html?persona=younger', 'Stories from younger owners', 'First homes, shared houses and more'],
    prepay: ['answers.html?q=prepay', 'Prepay smart meters', 'Top up online and see your balance'],
    install: ['get-a-smart-meter.html#on-the-day', 'What happens on the day', 'Step by step, from knock on the door'],
    switchup: ['switch-up.html', 'Switch Up, Stay Smart', 'Why your supplier may replace a working meter']
  };
  function route(a) {
    var r = [];
    function add(k) { if (r.indexOf(k) === -1) r.push(k); }
    if (a.concern === 'broken') { add('working'); add('switchup'); }
    if (a.meter === 'unsure') add('which');
    if (a.meter !== 'yes') add(a.home === 'business' ? 'getBiz' : 'get');
    var costKeys = a.meter === 'yes' ? ['prices', 'bills'] : ['bills', 'prices'];
    if (a.concern === 'cost') add(costKeys[0]);
    if (a.concern === 'install') add('install');
    if (a.concern === 'safety') add('safety');
    if (a.concern === 'data') add('data');
    if (a.home === 'rent') add('renter');
    else if (a.age === '65plus') add('older');
    else if (a.age === 'under35') add('younger');
    if (a.pay === 'prepay') add('prepay');
    if (a.concern === 'cost') add(costKeys[1]);
    if (a.meter === 'yes' && r.length < 2) add('prices');
    return r.slice(0, 4);
  }
  function linkHTML(k) {
    var l = LINKS[k];
    return '<a class="route-card" href="' + l[0] + '" data-route="' + k + '"><span class="route-title">' + esc(l[1]) + '</span><span class="route-text">' + esc(l[2]) + '</span></a>';
  }
  function initAssistants() {
    $all('[data-assistant]').forEach(function (box) {
      var answers = {};
      var step = 0;
      var uid = box.id || 'assistant';
      function render() {
        if (step >= QUESTIONS.length) return result();
        var q = QUESTIONS[step];
        box.innerHTML = '<p class="assistant-progress">Question ' + (step + 1) + ' of ' + QUESTIONS.length + '<span class="assistant-bar" aria-hidden="true"><span style="width:' + (step / QUESTIONS.length * 100) + '%"></span></span></p>' +
          '<fieldset class="assistant-q"><legend id="' + uid + '-q">' + esc(q.q) + '</legend><div class="assistant-opts">' +
          q.o.map(function (o) { return '<button type="button" class="assistant-opt" data-v="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') +
          '</div></fieldset><div class="row assistant-nav">' + (step ? '<button type="button" class="btn-link" data-back>Back</button>' : '') + '<button type="button" class="btn-link" data-skip>Skip this question</button></div>';
        $all('.assistant-opt', box).forEach(function (b) {
          b.addEventListener('click', function () {
            answers[q.id] = b.getAttribute('data-v');
            track('assistant_answer', { question: q.id, answer: answers[q.id] });
            step++; render(); focusQ();
          });
        });
        var back = $('[data-back]', box); if (back) back.addEventListener('click', function () { step--; render(); focusQ(); });
        $('[data-skip]', box).addEventListener('click', function () { track('assistant_skip', { question: q.id }); step++; render(); focusQ(); });
      }
      function focusQ() { var l = $('legend', box) || $('h3', box); if (l) { l.setAttribute('tabindex', '-1'); l.focus(); } }
      function result() {
        var r = route(answers);
        store('segb-profile', { answers: answers, routes: r });
        track('assistant_complete', { routes: r.join(',') });
        box.innerHTML = '<h3>Here\'s where we\'d start</h3><div class="route-list">' + r.map(linkHTML).join('') + '</div>' +
          '<div class="row assistant-nav"><button type="button" class="btn-link" data-restart>Start again</button></div>';
        $all('[data-route]', box).forEach(function (a) { a.addEventListener('click', function () { track('assistant_route_click', { route: a.getAttribute('data-route') }); }); });
        $('[data-restart]', box).addEventListener('click', function () { answers = {}; step = 0; render(); focusQ(); });
        renderPicked();
      }
      render();
    });
    var launch = $('.assistant-launch');
    if (launch) launch.addEventListener('click', function () { track('assistant_open', { page: window.location.pathname.split('/').pop() || 'index.html' }); });
  }

  /* --- Picked for you (R66) --------------------------------------------- */
  function renderPicked() {
    var box = $('[data-picked]');
    var p = store('segb-profile');
    if (!box) return;
    if (!p || !p.routes || !p.routes.length) { box.hidden = true; return; }
    box.hidden = false;
    $('[data-picked-list]', box).innerHTML = p.routes.map(linkHTML).join('');
    /* Move the most relevant door first */
    var doors = $('.doors');
    if (doors) {
      var key = p.answers.concern === 'broken' ? 'is-my-meter-working' : p.answers.meter === 'yes' ? 'energy-prices' : 'get-a-smart-meter';
      var d = $('.door[href*="' + key + '"]', doors);
      if (d) doors.insertBefore(d, doors.firstChild);
    }
  }
  function initPicked() {
    var box = $('[data-picked]');
    if (!box) return;
    renderPicked();
    $('[data-picked-clear]', box).addEventListener('click', function () { store('segb-profile', null); track('assistant_clear', {}); box.hidden = true; });
  }

  /* --- Installation journey (R18) --------------------------------------- */
  function initJourney() {
    var nav = $('[data-journey-nav]');
    if (!nav) return;
    var saved = store('segb-journey') || {};
    var boxes = $all('[data-check]');
    function update() {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      $('[data-journey-count]', nav).textContent = done + ' of ' + boxes.length;
      $('[data-journey-bar]', nav).style.width = (done / boxes.length * 100) + '%';
    }
    boxes.forEach(function (b) {
      b.checked = !!saved[b.id];
      b.addEventListener('change', function () {
        saved[b.id] = b.checked; store('segb-journey', saved); update();
        track('journey_check', { item: b.id, checked: b.checked, stage: b.closest('.step').id });
      });
    });
    update();
    $all('[data-day-timeline] .dt-step').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
        if (!open) track('install_step_open', { step: btn.textContent.replace(/^\d/, '').trim().slice(0, 40) });
      });
    });
    /* Sub-page links such as ?mode=business from the assistant */
    if (param('mode') === 'business') { var b = $('[data-mode="business"]'); if (b) b.click(); }
  }

  /* --- Stories (R60–R63) ------------------------------------------------- */
  function initStories() {
    var chips = $('[data-persona-chips]');
    if (!chips) return;
    var cards = $all('[data-story-grid] .story-card');
    var quotes = $all('[data-quote-grid] .quote-card');
    function apply(p) {
      $all('[data-persona]', chips).forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-persona') === p ? 'true' : 'false'); });
      var n = 0;
      cards.forEach(function (c) { var show = p === 'all' || c.getAttribute('data-personas').split(' ').indexOf(p) !== -1; c.hidden = !show; if (show) n++; });
      quotes.forEach(function (q) { var ps = q.getAttribute('data-personas').split(' '); q.hidden = !(p === 'all' || ps.indexOf(p) !== -1 || ps.indexOf('all') !== -1); });
      $('[data-persona-count]').textContent = (n === 1 ? '1 story' : n + ' stories') + (p === 'all' ? '' : ' from ' + $('[data-persona="' + p + '"]', chips).textContent.toLowerCase());
    }
    chips.addEventListener('click', function (e) {
      var c = e.target.closest('[data-persona]'); if (!c) return;
      apply(c.getAttribute('data-persona'));
      track('story_filter', { persona: c.getAttribute('data-persona') });
    });
    var start = param('persona');
    apply(start && $('[data-persona="' + start + '"]', chips) ? start : 'all');
    cards.forEach(function (c) { c.addEventListener('click', function () { track('story_open', { story: $('.story-title', c).textContent.slice(0, 50) }); }); });

    var f = $('#share-form');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      $all('[required]', f).forEach(function (i) {
        var ok = i.type === 'email' ? /.+@.+\..+/.test(i.value) : i.type === 'checkbox' ? i.checked : i.value.trim() !== '';
        var fld = i.closest('.field'); fld.classList.toggle('has-error', !ok); $('.field-error', fld).hidden = ok;
        if (!ok && !first) first = i;
      });
      if (first) { first.focus(); return; }
      track('story_submitted', { home: $('#sh-home').value });
      f.hidden = true; var d = $('#share-done'); d.hidden = false; $('h2', d).focus();
    });
  }

  /* --- Estimated bills simulator (R70–R72) ------------------------------- */
  var SCENARIOS = {
    winter: { extra: 25, months: 4, text: 'Your supplier estimates from last year. A colder winter means more heating than they expect.' },
    home: { extra: 30, months: 6, text: 'Working from home means heating, lights and a laptop on all day, which last year\'s figures don\'t show.' },
    baby: { extra: 35, months: 9, text: 'More washing, more hot water and a warmer house, from the day the baby arrives.' },
    move: { extra: 15, months: 3, text: 'In a new home, estimates are based on the previous occupant, who may have used much less than you.' }
  };
  function initSimulator() {
    var box = $('[data-simulator]');
    if (!box) return;
    var extra = $('#sim-extra'), months = $('#sim-months');
    var plot = $('[data-sim-plot]', box), tip = $('[data-sim-tip]', box);
    var CAP = window.SEGB_PRICE_CAP || { periods: [] };
    var iso = new Date().toISOString().slice(0, 10);
    var cap = CAP.periods.filter(function (p) { return p.from <= iso && iso <= p.to; })[0] || CAP.periods.filter(function (p) { return p.from <= '2026-09-28' && '2026-09-28' <= p.to; })[0];
    var monthly = cap.typical / 12;
    var data = [];

    function compute() {
      var x = parseInt(extra.value, 10) / 100, m = parseInt(months.value, 10);
      $('[data-sim-extra-out]', box).textContent = extra.value + '%';
      $('[data-sim-months-out]', box).textContent = m;
      data = [];
      for (var i = 1; i <= m; i++) data.push({ month: i, paid: monthly * i, used: monthly * (1 + x) * i });
      var gap = data[data.length - 1].used - data[data.length - 1].paid;
      $('[data-sim-catchup]', box).textContent = money(gap);
      $('[data-sim-explain]', box).textContent = 'You pay about ' + money(monthly) + ' a month on estimates for ' + m + (m === 1 ? ' month' : ' months') + '. When a real reading goes in, the ' + money(gap) + ' you\'ve used but not paid for arrives as one bill.';
      $('[data-sim-smart]', box).textContent = 'Readings go to your supplier automatically, so each bill matches what you used: about ' + money(monthly * (1 + x)) + ' a month here. You can see it coming on your display and adjust as you go.';
      $('[data-sim-rows]', box).innerHTML = data.map(function (d) { return '<tr><th scope="row">Month ' + d.month + '</th><td class="num">' + money(d.paid) + '</td><td class="num">' + money(d.used) + '</td><td class="num">' + money(d.used - d.paid) + '</td></tr>'; }).join('');
      draw();
    }
    function draw() {
      var W = 640, H = 320, L = 64, R = 24, T = 20, B = 44;
      var m = data.length;
      var maxY = Math.max(1, data[m - 1].used);
      var step = maxY > 3000 ? 1000 : maxY > 1200 ? 500 : maxY > 600 ? 200 : 100;
      var top = Math.ceil(maxY / step) * step;
      function x(i) { return L + (m === 1 ? (W - L - R) / 2 : (i - 1) * (W - L - R) / (m - 1)); }
      function y(v) { return T + (H - T - B) * (1 - v / top); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Line chart: after ' + m + ' months you have paid ' + money(data[m - 1].paid) + ' and used ' + money(data[m - 1].used) + '">';
      for (var v = 0; v <= top; v += step) s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"></line><text class="axis" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + money(v) + '</text>';
      data.forEach(function (d) { s += '<text class="axis" x="' + x(d.month) + '" y="' + (H - B + 20) + '" text-anchor="middle">' + d.month + '</text>'; });
      s += '<text class="axis" x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">Months since the last real reading</text>';
      var gapPts = data.map(function (d) { return x(d.month) + ',' + y(d.used); }).concat(data.slice().reverse().map(function (d) { return x(d.month) + ',' + y(d.paid); }));
      s += '<polygon class="gap" points="' + gapPts.join(' ') + '"></polygon>';
      function line(key, cls) { return '<polyline class="' + cls + '" points="' + data.map(function (d) { return x(d.month) + ',' + y(d[key]); }).join(' ') + '"></polyline>'; }
      s += line('paid', 'ln-paid') + line('used', 'ln-used');
      var last = data[m - 1];
      s += '<circle class="pt-paid" cx="' + x(m) + '" cy="' + y(last.paid) + '" r="5"></circle><circle class="pt-used" cx="' + x(m) + '" cy="' + y(last.used) + '" r="5"></circle>';
      s += '<line class="catch" x1="' + x(m) + '" x2="' + x(m) + '" y1="' + y(last.used) + '" y2="' + y(last.paid) + '"></line>';
      s += '<g class="hover" data-hover hidden><line class="cross" y1="' + T + '" y2="' + (H - B) + '"></line></g>';
      s += '<rect class="hit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '"></rect></svg>';
      plot.innerHTML = s;
      var svg = $('svg', plot), hit = $('.hit', svg), hov = $('[data-hover]', svg), cross = $('.cross', svg);
      function show(evt) {
        var rect = svg.getBoundingClientRect();
        var px = (evt.clientX - rect.left) / rect.width * W;
        var i = m === 1 ? 1 : Math.max(1, Math.min(m, Math.round((px - L) / ((W - L - R) / (m - 1)) + 1)));
        var d = data[i - 1];
        hov.removeAttribute('hidden'); cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
        tip.hidden = false;
        tip.innerHTML = '<strong>Month ' + i + '</strong><span><i class="lg lg-paid"></i>Paid ' + money(d.paid) + '</span><span><i class="lg lg-used"></i>Used ' + money(d.used) + '</span><span>Gap ' + money(d.used - d.paid) + '</span>';
        var left = x(i) / W * rect.width;
        tip.style.left = Math.min(Math.max(left, 70), rect.width - 70) + 'px';
      }
      hit.addEventListener('mousemove', show);
      hit.addEventListener('click', show);
      hit.addEventListener('mouseleave', function () { hov.setAttribute('hidden', ''); tip.hidden = true; });
    }
    var seg = $('.seg', box);
    function setScenario(k) {
      var sc = SCENARIOS[k];
      extra.value = sc.extra; months.value = sc.months;
      $('[data-sim-scenario]', box).textContent = sc.text;
      compute();
    }
    seg.addEventListener('segchange', function (e) { var k = e.detail.getAttribute('data-scenario'); setScenario(k); track('simulator_scenario', { scenario: k }); });
    [extra, months].forEach(function (i) {
      i.addEventListener('input', compute);
      i.addEventListener('change', function () { track('simulator_adjust', { extra_pct: extra.value, months: months.value }); });
    });
    setScenario('winter');
  }

  /* Show or hide the event log when the Notes switch changes */
  function initLogWatch() {
    new MutationObserver(renderLog).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* Sticky elements sit under the prototype navigator, whose height changes
     when its links wrap. */
  function initHeaderHeight() {
    var h = $('.site-header');
    if (!h) return;
    function set() { document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px'); }
    set();
    window.addEventListener('resize', set);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeaderHeight();
    initLogWatch();
    initAssistants();
    initPicked();
    initJourney();
    initStories();
    initSimulator();
  });
})();
