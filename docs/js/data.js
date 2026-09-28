/* ==========================================================================
   data.js — shared data for the Smart Energy GB prototypes.

   The point of prototypes 1, 3 and 5 is that facts live in ONE place and every
   page reads from it. In the real build these records would be managed in the
   CMS; here they are plain objects.

   Price cap figures: Ofgem (typical dual fuel, direct debit, incl. VAT).
   Smart meter figures: DESNZ quarterly statistics, end June 2026.
   Supplier phone numbers and URLs are NOT included; links are placeholders.
   ========================================================================== */

/* --- Suppliers (R10, idea #1) ------------------------------------------
   Current domestic suppliers, plus former suppliers mapped straight to the
   supplier that now looks after their customers. `alt` holds misspellings
   and short names people type. */
window.SEGB_SUPPLIERS = [
  { id: 'british-gas', name: 'British Gas', alt: 'bg britsh gas british gass' },
  { id: 'ecotricity', name: 'Ecotricity', alt: 'eco tricity' },
  { id: 'edf', name: 'EDF Energy', alt: 'edf edf energy' },
  { id: 'eon-next', name: 'E.ON Next', alt: 'eon e.on eon next' },
  { id: '100green', name: '100Green | Green Energy UK', alt: '100 green green energy uk' },
  { id: 'octopus', name: 'Octopus Energy', alt: 'octopus octupus octopuss' },
  { id: 'outfox', name: 'Outfox the Market', alt: 'outfox out fox' },
  { id: 'ovo', name: 'OVO Energy', alt: 'ovo ovoenergy' },
  { id: 'scottish-power', name: 'Scottish Power', alt: 'scottishpower sp' },
  { id: 'so-energy', name: 'So Energy', alt: 'so energy' },
  { id: 'utilita', name: 'Utilita', alt: 'utilita utillita' },
  { id: 'uw', name: 'Utility Warehouse', alt: 'uw utility warehouse' },
  { id: 'fuse', name: 'Fuse Energy', alt: 'fuse' },

  { id: 'bulb', name: 'Bulb', now: 'octopus', alt: 'bulb energy bolb' },
  { id: 'shell', name: 'Shell Energy', now: 'octopus', alt: 'shell energy retail shel' },
  { id: 'avro', name: 'Avro Energy', now: 'octopus', alt: 'avro afro' },
  { id: 'first-utility', name: 'First Utility', now: 'octopus', alt: 'first utility 1st utility' },
  { id: 'goto', name: 'Goto Energy', now: 'octopus', alt: 'goto go to energy' },
  { id: 'pure-planet', name: 'Pure Planet', now: 'octopus', alt: 'pure planet pureplanet' },
  { id: 'gnergy', name: 'GnErgy', now: 'octopus', alt: 'gnergy g energy' },
  { id: 'ms-energy', name: 'M&S Energy', now: 'octopus', alt: 'm&s marks and spencer' },
  { id: 'npower', name: 'npower', now: 'eon-next', alt: 'npower n power' },
  { id: 'igloo', name: 'Igloo Energy', now: 'eon-next', alt: 'igloo' },
  { id: 'sse', name: 'SSE', now: 'ovo', alt: 'sse southern electric' },
  { id: 'scottish-gas', name: 'Scottish Gas', now: 'british-gas', alt: 'scottish gas' },
  { id: 'peoples', name: "People's Energy", now: 'british-gas', alt: 'peoples energy' }
];

/* Business suppliers, as listed on the live small business site. */
window.SEGB_BUSINESS_SUPPLIERS = [
  { id: 'b-british-gas', name: 'British Gas', alt: 'bg' }, { id: 'b-corona', name: 'Corona Energy', alt: 'corona' },
  { id: 'b-edf', name: 'EDF', alt: 'edf energy' }, { id: 'b-eon', name: 'E.ON', alt: 'eon' },
  { id: 'b-octopus', name: 'Octopus', alt: 'octopus energy' }, { id: 'b-pozitive', name: 'Pozitive Energy', alt: 'positive pe solutions' },
  { id: 'b-scottish-power', name: 'Scottish Power', alt: 'sp' }, { id: 'b-sse', name: 'SSE Energy Solutions', alt: 'sse' },
  { id: 'b-total', name: 'TotalEnergies', alt: 'total' }, { id: 'b-uw', name: 'Utility Warehouse', alt: 'uw' },
  { id: 'b-valda', name: 'Valda Energy', alt: 'valda' }, { id: 'b-yu', name: 'Yu Energy', alt: 'yu' }
];

/* --- Energy price cap (R30, idea #13) -----------------------------------
   One record per cap period. Pages work out "current" and "next" from the
   date, so nobody has to edit a page on the day the cap changes. */
window.SEGB_PRICE_CAP = {
  source: 'Ofgem',
  typicalUse: { elecKwh: 2500, gasKwh: 9500 },
  periods: [
    { from: '2026-04-01', to: '2026-06-30', label: 'April to June 2026', typical: 1477 },
    { from: '2026-07-01', to: '2026-09-30', label: 'July to September 2026', typical: 1663,
      elec: { unit: 26.11, standing: 57.19 }, gas: { unit: 7.33, standing: 29.04 } },
    { from: '2026-10-01', to: '2026-12-31', label: 'October to December 2026', typical: 1723,
      elec: { unit: 26.32, standing: 54.83 }, gas: { unit: 7.97, standing: 29.68 } }
  ]
};

/* --- Peak times (R32, idea #15) --- */
window.SEGB_PEAK = { weekday: [16, 19], label: '4pm to 7pm, Monday to Friday' };

/* --- National figures (R41, idea #20) — DESNZ, end June 2026 --- */
window.SEGB_FIGURES = {
  asOf: 'end of June 2026',
  source: 'Department for Energy Security and Net Zero, quarterly smart meter statistics',
  items: [
    { value: '42 million', label: 'smart and advanced meters in homes and small businesses in Great Britain' },
    { value: '72%', label: 'of all gas and electricity meters are now smart or advanced' },
    { value: '92%', label: 'of smart meters are working in smart mode, sending readings automatically' }
  ]
};

/* --- Answers (R50–R54, ideas #19, #29, #30) ------------------------------
   One source for every FAQ. Topics drive the filter chips; `myth` marks the
   myth-and-fact pairs. Wording follows the live FAQs and needs Smart Energy
   GB's sign-off. */
window.SEGB_TOPICS = [
  { id: 'getting', label: 'Getting one' },
  { id: 'using', label: 'Using it' },
  { id: 'problems', label: 'Problems' },
  { id: 'prices', label: 'Prices and bills' },
  { id: 'safety', label: 'Safety and data' },
  { id: 'renting', label: 'Renting' },
  { id: 'business', label: 'Small business' }
];
window.SEGB_ANSWERS = [
  { id: 'cost', topic: 'getting', q: 'Can I get a smart meter for free?', a: 'There is no extra cost for installing a smart meter, and you won\'t see a separate charge on your bill for having one. The cost of the rollout is spread across everyone\'s bills, in the same way as the cost of running traditional meters.', tags: 'free cost price charge pay', link: 'get-a-smart-meter.html' },
  { id: 'how-get', topic: 'getting', q: 'How do I get a smart meter?', a: 'Contact your energy supplier. They\'ll book a date, and an installer will fit the meters and set up your in-home display. Use our supplier finder to go straight to the right page.', tags: 'book request install order apply', link: 'get-a-smart-meter.html' },
  { id: 'how-long', topic: 'getting', q: 'How long does installation take?', a: 'Usually around two hours for gas and electricity. Your supply will be off for a short time while the meter is changed.', tags: 'time long hours install appointment', link: 'get-a-smart-meter.html' },
  { id: 'compulsory', topic: 'getting', q: 'Do I have to have a smart meter?', a: 'No. Smart meters aren\'t compulsory, but your supplier will offer you one. Having one means automatic readings and accurate bills.', tags: 'compulsory must mandatory refuse choice' },
  { id: 'already', topic: 'getting', q: 'How do I know if I already have a smart meter?', a: 'Smart meters usually have a digital display and a small label from your supplier, and came with a portable in-home display. Our meter checker shows the common types side by side.', tags: 'already have check which type identify', link: 'which-meter.html' },
  { id: 'ni', topic: 'getting', q: 'Can I get a smart meter in Northern Ireland?', a: 'The smart meter rollout covers England, Scotland and Wales. It doesn\'t currently include Northern Ireland.', tags: 'northern ireland ni belfast' },
  { id: 'two-suppliers', topic: 'getting', q: 'My gas and electricity come from different suppliers. What do I do?', a: 'Contact both suppliers. If you can, have your electricity smart meter installed first, because the gas meter connects through it.', tags: 'different suppliers gas electricity two dual' },

  { id: 'ihd', topic: 'using', q: 'What does the in-home display show?', a: 'How much energy you\'re using right now and what it\'s costing in pounds and pence, plus what you\'ve used today, this week and this month.', tags: 'display ihd screen shows show' },
  { id: 'wifi', topic: 'using', q: 'Do I need Wi-Fi for a smart meter?', a: 'No. Smart meters send readings over their own secure network, which is separate from the internet and doesn\'t use your broadband.', tags: 'wifi wi-fi internet broadband signal', myth: 'Smart meters need your Wi-Fi to work.' },
  { id: 'switch', topic: 'using', q: 'Can I switch supplier if I have a smart meter?', a: 'Yes. You can switch supplier or tariff as you would with any meter. Your smart meter keeps sending readings to your new supplier.', tags: 'switch change supplier tariff move', myth: 'You can\'t switch supplier with a smart meter.' },
  { id: 'prepay', topic: 'using', q: 'Do smart meters work with prepay?', a: 'Yes. A prepay smart meter lets you top up online, by app or by phone, and see your balance on the in-home display.', tags: 'prepay prepayment top up key card payg' },
  { id: 'move-house', topic: 'using', q: 'Do I leave the in-home display when I move house?', a: 'Yes. The display is paired to the meters in that home, so leave it for the next person.', tags: 'move house moving leave display' },
  { id: 'accessible-ihd', topic: 'using', q: 'Is there an in-home display for blind or partially sighted people?', a: 'Yes. Accessible displays with large text, audio or tactile controls are available. Ask your supplier.', tags: 'accessible blind sight audio large text disability' },

  { id: 'estimated', topic: 'problems', q: 'I have a smart meter, so why is my bill estimated?', a: 'In the first few weeks after installation, or after switching supplier, your supplier may still be connecting to your meter. If it carries on, your meter may not be sending readings. Use our checker to find out what to do.', tags: 'estimated estimate bill reading asked readings', link: 'is-my-meter-working.html' },
  { id: 'blank', topic: 'problems', q: 'My in-home display is blank or not updating. What should I do?', a: 'Check it\'s plugged in and close to your meter, then restart it. If that doesn\'t help, your supplier can reconnect it or send a new one.', tags: 'blank display not working off dead ihd broken', link: 'is-my-meter-working.html' },
  { id: 'switch-up', topic: 'problems', q: 'Why is my supplier replacing a smart meter that works?', a: 'Some older smart meter equipment uses 2G and 3G mobile networks, which are being switched off. Your supplier is replacing it so your meter stays connected, at no extra cost to you.', tags: '2g 3g 4g switch up replace replacement communications hub network upgrade letter', link: 'switch-up.html' },
  { id: 'rts', topic: 'problems', q: 'My heating and hot water are coming on at the wrong times. Could it be my meter?', a: 'If you have an older Radio Teleswitch (RTS) meter, it may no longer work as expected because the signal that controls it has been switched off. Contact your supplier to have it replaced.', tags: 'rts radio teleswitch storage heaters heating hot water economy 7 wrong time' },
  { id: 'power-cut', topic: 'problems', q: 'I have no power. Is it my smart meter?', a: 'If your neighbours have also lost power, it\'s probably a power cut: call 105. If you smell gas, call the gas emergency line on 0800 111 999. If you\'re on prepay, check your credit.', tags: 'power cut no electricity gas smell emergency 105' },

  { id: 'save', topic: 'prices', q: 'Can a smart meter help me save money?', a: 'A smart meter doesn\'t save energy by itself. Seeing what you use, and what it costs, helps you spot where you could cut back.', tags: 'save money cheaper reduce bills' },
  { id: 'price-cap', topic: 'prices', q: 'What is the energy price cap?', a: 'A limit set by Ofgem on the unit rates and standing charges suppliers can charge on standard variable tariffs. It changes every three months.', tags: 'price cap ofgem rise fall october', link: 'energy-prices.html' },
  { id: 'peak', topic: 'prices', q: 'When are peak electricity times?', a: 'Typically 4pm to 7pm, Monday to Friday. Night-time and weekends are usually off-peak.', tags: 'peak off-peak off peak cheap time night', link: 'energy-prices.html' },
  { id: 'tou', topic: 'prices', q: 'Can I be charged different prices at different times of day?', a: 'Yes, if you choose a time-of-use tariff. A smart meter records when you use energy, which makes these tariffs possible.', tags: 'time of use tariff different prices times' },

  { id: 'safe', topic: 'safety', q: 'Are smart meters safe?', a: 'Yes. The radio waves smart meters give off are typically around a million times below guideline levels.', tags: 'safe safety radiation health radio waves', myth: 'Smart meter radio waves are bad for your health.' },
  { id: 'data', topic: 'safety', q: 'Who can see my energy data?', a: 'Your supplier uses meter readings to bill you. You choose whether they can see more detailed readings, such as half-hourly use, and you can change your mind.', tags: 'data privacy personal see share who' },
  { id: 'cut-off', topic: 'safety', q: 'Does a smart meter make it easier to cut off my energy?', a: 'No. The same rules and protections on disconnection apply whether you have a smart meter or not.', tags: 'cut off disconnect switch off remotely', myth: 'Suppliers can cut you off more easily with a smart meter.' },
  { id: 'extra-cost', topic: 'safety', q: 'Will I pay more because I have a smart meter?', a: 'No. There\'s no extra charge on your bill for having a smart meter.', tags: 'pay more extra cost bill', myth: 'Having a smart meter puts your bills up.' },

  { id: 'renter', topic: 'renting', q: 'I rent. Can I get a smart meter?', a: 'Yes. If you pay the energy bills, you can ask your supplier for one. It\'s a good idea to tell your landlord, and check your tenancy agreement.', tags: 'rent renting renter tenant landlord permission' },
  { id: 'landlord', topic: 'renting', q: 'I\'m a landlord. Should I get smart meters for my properties?', a: 'If you pay the bills, contact your supplier. If your tenants pay, they can request one. Smart meters make readings between tenancies simpler.', tags: 'landlord property let tenants' },

  { id: 'business', topic: 'business', q: 'Can my small business get a smart meter?', a: 'Yes. Most small businesses can get one at no extra cost from their energy supplier. Ask them about installation times that suit your business.', tags: 'business small business shop office work' }
];
