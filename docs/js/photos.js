/* ==========================================================================
   photos.js — Smart Energy GB photography for the design layer (V2)

   Swaps the illustrated placeholders for Smart Energy GB's own photography,
   loaded directly from smartenergygb.org. Each image is only applied once it
   has loaded, so wherever the images can't be reached the illustrated
   placeholder stays in place. Photography © Smart Energy GB, used here to
   show how the proposals would look on the live site.

   Photos next to named owners' quotes stay as placeholders on purpose: we
   don't have pictures of those people, and pairing their words with someone
   else's face would misrepresent them.
   ========================================================================== */

(function () {
  'use strict';

  var BASE = 'https://www.smartenergygb.org/media/';
  function u(path, w) { return BASE + path + '?width=' + (w || 1440) + '&format=webp&quality=80'; }

  var P = {
    hero: u('tgcp3eqt/9d2228a949db7b038ad00f1f43a9285e20715804-1.jpg'),
    switchup: u('ikidy1ws/mobile-mm-banner-image-draft.png'),
    installer: u('bc3ff1xu/installer-buffer-767x600.jpg'),
    ihdBanner: u('dfdlwms3/ihd_1440_400.jpg'),
    tea: u('kien3kez/ihd-2-making-cup-of-tea.jpeg'),
    bills: u('0uyb3fro/couple-workking-over-bills-mobile-cropped-for-size.jpg'),
    einstein: u('qbepoteq/einstein_chico_1440_2.jpg'),
    johnny: u('40mhslwf/jvgasmedit.jpg'),
    prepay: u('rekhuzu5/unleashed-1.png'),
    smartMeter: u('21qb0mr1/electric-smart-meter-resized-floating.png', 800),
    ihdA: u('bbnhulq1/ihd-screen.png', 900),
    ihdB: u('1pjbhdg0/aihd-campaign-module.jpg', 900),
    ihdPrepay: u('zvglng3f/image-of-a-prepay-ihd.png', 900)
  };

  /* Placeholders are matched on their label text. `fit: contain` is for
     product shots on a plain background, which shouldn't be cropped. */
  var LABEL = {
    'get a smart meter': { src: P.installer },
    'is my meter working?': { src: P.ihdBanner, pos: '82% center' },
    'energy prices': { src: P.tea },
    'homepage': { src: P.hero },
    'find an answer': { src: P.bills },
    'campaign photo: people at home with the in-home display in shot': { src: P.hero },
    'video: switch up, stay smart campaign film': { src: P.switchup, video: true },
    'video: campaign film, with captions and transcript': { src: P.switchup, video: true },
    'photo: einstein energy tips': { src: P.einstein, pos: '22% center' },
    'photo: johnny vegas installation': { src: P.johnny },
    'photo: prepay smart meter': { src: P.prepay },
    'photo: smart meter with in-home display': { src: P.smartMeter, fit: 'contain' },
    'photo: display type a, screens labelled': { src: P.ihdA, fit: 'contain' },
    'photo: display type b, screens labelled': { src: P.ihdB },
    'photo: prepay display, balance screen': { src: P.ihdPrepay, fit: 'contain' }
  };

  function apply(el, m) {
    if (!el || el.hasAttribute('data-photo')) return;
    el.setAttribute('data-photo', m.src);
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + m.src + '")';
      el.classList.add('has-photo');
      if (m.pos) el.style.backgroundPosition = m.pos;
      if (m.fit === 'contain') el.classList.add('photo-contain');
      if (m.video) el.classList.add('photo-video');
      if (!el.hasAttribute('role') && !el.closest('[aria-hidden="true"]')) {
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', (el.textContent || 'Photo').replace(/^(photo|video|campaign photo):\s*/i, '').trim());
      }
    };
    img.src = m.src;
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.wf-placeholder').forEach(function (el) {
      var m = LABEL[(el.textContent || '').trim().toLowerCase()];
      if (m) apply(el, m);
    });
  });
})();
