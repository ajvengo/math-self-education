/* Shared engine for the history self-study series (10 tijdvakken).
   An epoch page loads this file, then calls initTijdvak({...}) with its own data. */
const T = (ru, nl) => `<span class="ru">${ru}</span><span class="nl">${nl}</span>`;
const TB = (ru, nl) => `<div class="bi"><div class="ru">${ru}</div><div class="nl">${nl}</div></div>`;
const $ = id => document.getElementById(id);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

const TIJDVAKKEN = [
  { n: 1, f: 'tijdvak-1-jagers-en-boeren.html', nl: 'Jagers en boeren', ru: 'Hunters and farmers', d: '– 3000 v.Chr.' },
  { n: 2, f: 'tijdvak-2-grieken-en-romeinen.html', nl: 'Grieken en Romeinen', ru: 'Greeks and Romans', d: '3000 v.Chr. – 500' },
  { n: 3, f: 'tijdvak-3-monniken-en-ridders.html', nl: 'Monniken en ridders', ru: 'Monks and knights', d: '500 – 1000' },
  { n: 4, f: 'tijdvak-4-steden-en-staten.html', nl: 'Steden en staten', ru: 'Cities and states', d: '1000 – 1500' },
  { n: 5, f: 'tijdvak-5-ontdekkers-en-hervormers.html', nl: 'Ontdekkers en hervormers', ru: 'Explorers and reformers', d: '1500 – 1600' },
  { n: 6, f: 'tijdvak-6-regenten-en-vorsten.html', nl: 'Regenten en vorsten', ru: 'Regents and monarchs', d: '1600 – 1700' },
  { n: 7, f: 'tijdvak-7-pruiken-en-revoluties.html', nl: 'Pruiken en revoluties', ru: 'Wigs and revolutions', d: '1700 – 1800' },
  { n: 8, f: 'tijdvak-8-burgers-en-stoommachines.html', nl: 'Burgers en stoommachines', ru: 'Citizens and steam engines', d: '1800 – 1900' },
  { n: 9, f: 'tijdvak-9-wereldoorlogen.html', nl: 'Wereldoorlogen', ru: 'World wars', d: '1900 – 1950' },
  { n: 10, f: 'tijdvak-10-televisie-en-computer.html', nl: 'Televisie en computer', ru: 'Television and computer', d: '1950 – nu' }
];

function initTijdvak(cfg) {
  const K = 'hist-en-' + cfg.id + '-';
  const cur = TIJDVAKKEN[cfg.n - 1];

  /* ---------- epoch switcher ---------- */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const nav = document.createElement('nav');
    nav.className = 'epochs';
    const prev = TIJDVAKKEN[cfg.n - 2], next = TIJDVAKKEN[cfg.n];
    nav.innerHTML = `<span class="lbl">Epoch / Tijdvak:</span>` +
      `<a class="step ${prev ? '' : 'off'}" href="${prev ? prev.f : '#'}" title="${prev ? prev.n + '. ' + prev.nl : ''}">◀</a>` +
      TIJDVAKKEN.map(t => `<a href="${t.f}" class="${t.n === cfg.n ? 'cur' : ''}" title="${t.n}. Tijd van ${t.nl.toLowerCase()} (${t.d}) · ${t.ru}">${t.n}</a>`).join('') +
      `<a class="step ${next ? '' : 'off'}" href="${next ? next.f : '#'}" title="${next ? next.n + '. ' + next.nl : ''}">▶</a>` +
      `<span class="curname">${cur.nl} <span class="ru">(${cur.ru.toLowerCase()})</span> · ${cur.d}</span>`;
    topbar.insertBefore(nav, topbar.firstChild);
  }
  const grid = $('tvGrid');
  if (grid) grid.innerHTML = TIJDVAKKEN.map(t => `<a class="tv ${t.n === cfg.n ? 'now' : ''}" href="${t.f}"><b>${t.n}</b>${t.nl}<br>${t.d}</a>`).join('');

  /* ---------- standard tabs (if not already in the HTML) ---------- */
  const main = document.querySelector('main.container'), foot = main.querySelector('footer');
  const addSec = (html) => { const t = document.createElement('div'); t.innerHTML = html.trim(); main.insertBefore(t.firstChild, foot); };
  let nTab = document.querySelectorAll('section.page').length;
  if (!$('chain') && cfg.CHAIN) addSec(`<section class="page" id="p-keten" data-title-ru="Cause and effect" data-title-nl="Oorzaak en gevolg" data-n="${nTab++}">
  <div class="kern"><div class="lbl">Kernvraag</div><div class="q">${T('How does one change lead to the next? Click a link to see the “why” and the “what if not”.', 'Hoe volgt de ene verandering uit de andere? Klik op een schakel voor het "waarom" en het "wat als niet".')}</div></div>
  <div class="chain" id="chain"></div>
  <div class="card node-detail" id="nodeDetail"><span class="muted">${T('Pick a link in the chain above.', 'Kies een schakel hierboven.')}</span></div>
  <div class="card"><h3 style="margin-top:0">${T('Exercise: put the chain in order', 'Oefening: zet de keten in de goede volgorde')}</h3>
    <p class="muted">${T('Click the links in “cause → effect” order. Click again to undo.', 'Klik de schakels aan in de volgorde oorzaak → gevolg. Nog een keer klikken = terug.')}</p>
    <div class="order-items" id="orderItems"></div>
    <div class="button-row"><button class="action primary" id="orderCheck">${T('Check', 'Controleer')}</button><button class="action" id="orderNew">${T('Another chain', 'Andere keten')}</button></div>
    <div id="orderMsg"></div></div>
  <div class="card"><h3 style="margin-top:0">${T('How to write a “leg uit” (explain) answer in a test', 'Hoe schrijf je een "leg uit"-antwoord?')}</h3>
    ${TB('<p>First work out <b>what is being asked</b>: <span class="nlt">Noem</span> — name it; <span class="nlt">Beschrijf</span> — describe its features; <span class="nlt">Leg uit / Verklaar</span> — explain the mechanism; <span class="nlt">Vergelijk</span> — compare on the same feature; <span class="nlt">Onderbouw</span> — back it up with an argument or a source.</p><p>Pattern: <b>cause → mechanism (how exactly?) → effect</b> (+ VWO+: <b>condition or exception</b>). Linking words: <span class="nlt">doordat</span> · <span class="nlt">daardoor</span> · <span class="nlt">waardoor</span> · <span class="nlt">omdat</span> · <span class="nlt">dus</span> · <span class="nlt">zodat</span> · <span class="nlt">maar</span> · <span class="nlt">als</span></p>' + (cfg.legUit ? '<p>❌ <i>' + cfg.legUit[0] + '</i> — no link between the facts.<br>✅ <i>' + cfg.legUit[1] + '</i></p>' : ''),
      '<p>Kijk eerst <b>wat er gevraagd wordt</b>: <span class="nlt">Noem</span> — geef kort het feit; <span class="nlt">Beschrijf</span> — geef kenmerken; <span class="nlt">Leg uit / Verklaar</span> — laat het mechanisme zien; <span class="nlt">Vergelijk</span> — gebruik hetzelfde kenmerk; <span class="nlt">Onderbouw</span> — geef een argument of bron.</p><p>Schema: <b>oorzaak → hoe werkt het → gevolg</b> (+ vwo+: <b>voorwaarde of uitzondering</b>). Signaalwoorden: <span class="nlt">doordat</span> · <span class="nlt">daardoor</span> · <span class="nlt">waardoor</span> · <span class="nlt">omdat</span> · <span class="nlt">dus</span> · <span class="nlt">zodat</span> · <span class="nlt">maar</span> · <span class="nlt">als</span></p>' + (cfg.legUit ? '<p>❌ <i>' + cfg.legUit[2] + '</i> — geen verband.<br>✅ <i>' + cfg.legUit[1] + '</i></p>' : ''))}</div>
</section>`);
  if (!$('watals') && (cfg.WATALS || cfg.PATHS)) addSec(`<section class="page" id="p-watals" data-title-ru="What if?" data-title-nl="Wat als?" data-n="${nTab++}">
  <div class="kern"><div class="lbl">Denkvragen</div><div class="q">${T('Think first and write your own answer (2–4 sentences with “because / so”). Then open the explanation.', 'Denk eerst zelf na en schrijf een antwoord (2–4 zinnen met "omdat / daardoor"). Open daarna de uitleg.')}</div></div>
  <h3>${T(cfg.pathsTitle ? cfg.pathsTitle[0] : 'Crossroads: you decide', cfg.pathsTitle ? cfg.pathsTitle[1] : 'Keuzepaden: jij beslist')}</h3>
  <p class="muted">${T('Choose a path and see what follows. Name the gain, the risk and the condition for success. Under each choice you also see what really happened.', 'Kies een pad en bekijk de gevolgen. Noem voordeel, risico en voorwaarde. Bij elke keuze staat ook wat er echt gebeurde.')}</p>
  <div id="paths"></div>
  <h3>${T('“What if?” questions', 'Denkvragen "wat als?"')}</h3>
  <div id="watals"></div>
</section>`);
  if (!$('terms') && cfg.TERMS) addSec(`<section class="page" id="p-begrippen" data-title-ru="Terms" data-title-nl="Begrippen" data-n="${nTab++}">
  <div class="kern"><div class="lbl">Begrippen</div><div class="q">${T('Terms for the test: Dutch — English — meaning.', 'Begrippen voor de toets: Nederlands — Engels — betekenis.')}</div></div>
  <div class="card no-print"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <b>${T('Flashcards:', 'Flitskaarten:')}</b>
    <select id="flashMode"><option value="nl">NL → EN + uitleg</option><option value="def">uitleg → NL begrip</option><option value="ru">EN → NL</option></select>
    <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="flashUnknown"> ${T('only the ones I don’t know yet', 'alleen nog niet gekend')}</label>
    <span class="score" id="flashCount"></span></div>
    <div class="card flash" id="flash" style="margin-top:12px"></div>
    <div class="button-row" style="justify-content:center"><button class="action" id="flashAgain">↺ ${T('Not yet', 'Nog niet')}</button><button class="action primary" id="flashKnown">✓ ${T('Know it', 'Ken ik')}</button></div></div>
  <div class="card"><div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
    <input id="termSearch" placeholder="zoek / search…" style="flex:1;min-width:180px">
    <button class="action" id="termReset">${T('Reset “know it”', 'Reset "ken ik"')}</button>
    <button class="action" onclick="window.print()">🖨 ${T('Print / PDF', 'Afdrukken')}</button></div>
    <table class="terms" id="terms"></table></div>
</section>`);
  if (!$('quizBox') && cfg.Q) addSec(`<section class="page" id="p-toets" data-title-ru="Test" data-title-nl="Oefentoets" data-n="${nTab++}">
  <div class="kern"><div class="lbl">Oefentoets</div><div class="q">${T('Practice test: 12 random questions. The questions are in Dutch, as at school (the English translation shows in EN + NL mode).', 'Oefentoets: 12 willekeurige vragen, zoals op school.')}</div></div>
  <div class="card no-print"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <select id="quizTopic"><option value="all">Alle onderwerpen / all topics</option>${(cfg.topics || []).map(t => `<option value="${t[0]}">${t[1]}</option>`).join('')}</select>
    <button class="action primary" id="quizStart">${T('Start', 'Start')}</button><span class="score" id="quizBest"></span></div></div>
  <div class="card" id="quizBox"><span class="muted">${T('Click “Start”.', 'Klik op "Start".')}</span></div>
</section>`);

  /* ---------- language ---------- */
  function setLang(l) {
    document.body.dataset.lang = l;
    document.querySelectorAll('[data-setlang]').forEach(b => b.classList.toggle('active', b.dataset.setlang === l));
    document.documentElement.lang = l === 'nl' ? 'nl' : 'en';
    store.set('hist-lang', l);
  }
  document.querySelectorAll('[data-setlang]').forEach(b => b.onclick = () => setLang(b.dataset.setlang));
  setLang(store.get('hist-lang', 'both'));

  /* ---------- tabs ---------- */
  const pages = [...document.querySelectorAll('section.page')];
  const tabs = $('tabs');
  pages.forEach(p => {
    const b = document.createElement('button');
    b.className = 'tab'; b.dataset.target = p.id;
    b.innerHTML = `<span class="num">${p.dataset.n}</span>` + T(p.dataset.titleRu, p.dataset.titleNl);
    b.onclick = () => showPage(p.id, true);
    tabs.appendChild(b);
  });
  function showPage(id, scroll) {
    pages.forEach(p => p.classList.toggle('hidden', p.id !== id));
    tabs.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.target === id));
    const act = tabs.querySelector('.tab.active'); if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center' });
    if (scroll) { history.replaceState(null, '', '#' + id); window.scrollTo({ top: 0 }); }
  }
  const startId = location.hash && document.getElementById(location.hash.slice(1)) ? location.hash.slice(1) : pages[0].id;
  showPage(startId, false);
  document.querySelectorAll('a[data-tab]').forEach(a => a.onclick = e => { e.preventDefault(); showPage(a.dataset.tab, true); });
  window.addEventListener('beforeprint', () => pages.forEach(p => p.classList.remove('hidden')));
  window.addEventListener('afterprint', () => showPage(tabs.querySelector('.tab.active').dataset.target, false));

  /* ---------- century trainer ---------- */
  if ($('eeuwTrainer')) {
    const range = cfg.eeuwRange || [-6000, 2025];
    let eeuw = null, eeuwOk = 0, eeuwAll = 0;
    const newEeuw = () => {
      let y = 0; while (y === 0) y = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      if (Math.random() < 0.3) y = Math.round(y / 100) * 100 || 100;
      const bc = y < 0, year = Math.abs(y);
      eeuw = { year, bc, ans: Math.ceil(year / 100) };
      $('eeuwQ').innerHTML = `${year} ${bc ? 'v.Chr.' : 'n.Chr.'} → ${T('which century?', 'welke eeuw?')}`;
      $('eeuwA').value = ''; $('eeuwMsg').innerHTML = '';
    };
    $('eeuwCheck').onclick = () => {
      if (!eeuw) return;
      const v = parseInt($('eeuwA').value, 10), side = $('eeuwAD').value;
      const ok = v === eeuw.ans && (side === 'v') === eeuw.bc;
      eeuwAll++; if (ok) eeuwOk++;
      const expl = `${eeuw.year} : 100 = ${(eeuw.year / 100).toString().replace('.', ',')} → ${T('round up', 'naar boven afronden')} → <b>${eeuw.ans}e eeuw ${eeuw.bc ? 'v.Chr.' : 'n.Chr.'}</b>`;
      $('eeuwMsg').innerHTML = `<div class="message ${ok ? 'ok' : 'bad'}">${ok ? '✓ ' : '✗ '}${expl}</div>`;
      $('eeuwScore').textContent = `${eeuwOk} / ${eeuwAll}`;
    };
    $('eeuwNext').onclick = newEeuw;
    $('eeuwA').addEventListener('keydown', e => { if (e.key === 'Enter') $('eeuwCheck').click(); });
    newEeuw();
  }

  /* ---------- chain ---------- */
  const CHAIN = cfg.CHAIN || [];
  const chainEl = $('chain');
  if (chainEl) CHAIN.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'node';
    d.innerHTML = `<div class="n">${i + 1}${i < CHAIN.length - 1 ? ' →' : ''}</div>` + T(c.ru, c.nl);
    d.onclick = () => {
      chainEl.querySelectorAll('.node').forEach(n => n.classList.remove('active')); d.classList.add('active');
      const prev = i > 0 ? CHAIN[i - 1] : null;
      $('nodeDetail').innerHTML = `<h3 style="margin-top:0">${i + 1}. ${T(c.ru, c.nl)}</h3>` +
        (prev ? `<p class="muted">${T('Follows from: <b>' + prev.ru + '</b>', 'Volgt uit: <b>' + prev.nl + '</b>')}</p>` : '') +
        `<p><b>🤔 ${T('Why?', 'Waarom?')}</b></p>` + TB(c.why[0], c.why[1]) +
        `<p><b>🔀 ${T('What if it had gone differently?', 'Wat als het anders was?')}</b></p>` + TB(c.alt[0], c.alt[1]) +
        (c.law ? `<div class="memo">${T(c.law[0], c.law[1])}</div>` : '');
    };
    chainEl.appendChild(d);
  });

  /* ---------- ordering exercise ---------- */
  const ORDER_SETS = cfg.ORDER_SETS || [];
  if ($('orderItems') && ORDER_SETS.length) {
    let orderSet = null, orderPicked = [], orderShown = [];
    const renderOrder = list => {
      if (list) orderShown = list;
      const box = $('orderItems'); box.innerHTML = '';
      orderShown.forEach(it => {
        const b = document.createElement('button');
        const k = orderPicked.indexOf(it);
        b.className = 'order-item' + (k >= 0 ? ' picked' : '');
        b.innerHTML = `<span class="badge">${k >= 0 ? k + 1 : ''}</span>` + T(it.ru, it.nl);
        b.onclick = () => { const j = orderPicked.indexOf(it); if (j >= 0) orderPicked.splice(j, 1); else orderPicked.push(it); renderOrder(); $('orderMsg').innerHTML = ''; };
        box.appendChild(b);
      });
    };
    const newOrder = () => {
      const idx = Math.floor(Math.random() * ORDER_SETS.length);
      orderSet = ORDER_SETS[idx].map((x, i) => ({ ru: x[0], nl: x[1], pos: i }));
      orderPicked = [];
      renderOrder(shuffle(orderSet));
      $('orderMsg').innerHTML = '';
    };
    $('orderCheck').onclick = () => {
      if (orderPicked.length < orderSet.length) { $('orderMsg').innerHTML = `<div class="message">${T('Number all the links first.', 'Nummer eerst alle schakels.')}</div>`; return; }
      const ok = orderPicked.every((it, i) => it.pos === i);
      renderOrder();
      [...$('orderItems').children].forEach((b, i) => { const it = orderShown[i]; b.classList.add(orderPicked.indexOf(it) === it.pos ? 'right' : 'wrong'); });
      const right = orderSet.map(x => T(x.ru, x.nl)).join(' → ');
      $('orderMsg').innerHTML = `<div class="message ${ok ? 'ok' : 'bad'}">${ok ? '✓ ' + T('Correct! Now explain each arrow out loud: “because…”.', 'Goed! Leg nu elke pijl hardop uit: "omdat…".') : '✗ ' + T('Not quite. The right order:', 'Niet helemaal. De goede volgorde:') + '<br>' + right}</div>`;
    };
    $('orderNew').onclick = newOrder;
    newOrder();
  }

  /* ---------- crossroads ---------- */
  const PATHS = cfg.PATHS || [];
  if ($('paths')) {
    $('paths').innerHTML = PATHS.map((p, i) => `<div class="card"><b>${i + 1}. ${T(p.t[0], p.t[1])}</b>
      <div class="branch" style="margin-top:10px">${p.o.map((o, j) => `<button data-p="${i}" data-o="${j}">${T(o[0][0], o[0][1])}</button>`).join('')}</div>
      <div id="pathMsg${i}"></div></div>`).join('');
    document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
      const i = +b.dataset.p, j = +b.dataset.o, o = PATHS[i].o[j];
      document.querySelectorAll(`[data-p="${i}"]`).forEach(x => x.classList.toggle('sel', x === b));
      $('pathMsg' + i).innerHTML = `<div class="message">${T(o[1][0], o[1][1])}</div>`;
    });
  }

  /* ---------- what if ---------- */
  const WATALS = cfg.WATALS || [];
  if ($('watals')) {
    $('watals').innerHTML = WATALS.map((w, i) => `
      <div class="card">
        <h3 style="margin-top:0">${i + 1}. ${T(w[0], w[1])}</h3>
        <textarea class="no-print" placeholder="My answer / Mijn antwoord…" data-wa="${i}"></textarea>
        <details class="why"><summary>${T('Explanation', 'Uitleg')}</summary><div>${TB('<p>' + w[2] + '</p>', '<p>' + w[3] + '</p>')}</div></details>
      </div>`).join('');
    document.querySelectorAll('[data-wa]').forEach(t => {
      const k = K + 'wa-' + t.dataset.wa;
      t.value = store.get(k, '');
      t.addEventListener('input', () => store.set(k, t.value));
    });
  }

  /* ---------- lab (shared model: sliders → bar → conclusion) ---------- */
  const LAB = cfg.LAB;
  if (LAB && $('lab')) {
    $('lab').innerHTML = (LAB.note ? `<p class="muted">${T(LAB.note[0], LAB.note[1])}</p>` : '') +
      `<div class="lab-grid">${LAB.sliders.map(s => `<label>${T(s.ru, s.nl)}: <b id="lv-${s.k}"></b><input type="range" id="ls-${s.k}" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${s.v}"></label>`).join('')}</div>
      <div class="bar" id="labBar"></div>
      <div class="button-row">${LAB.presets.map((p, i) => `<button class="action" data-lp="${i}">${T(p.ru, p.nl)}</button>`).join('')}</div>
      <div id="labMsg"></div>`;
    const draw = () => {
      const v = {}; LAB.sliders.forEach(s => { v[s.k] = +$('ls-' + s.k).value; $('lv-' + s.k).textContent = v[s.k] + (s.unit || ''); });
      const r = LAB.calc(v);
      const total = r.segs.reduce((a, s) => a + Math.max(0, s[0]), 0) || 1;
      $('labBar').innerHTML = r.segs.filter(s => s[0] > 0).map(s => `<div style="width:${100 * s[0] / total}%;background:${s[1]}">${s[2]}</div>`).join('');
      $('labMsg').innerHTML = `<div class="message ${r.cls || ''}">${T(r.ru, r.nl)}</div>`;
    };
    LAB.sliders.forEach(s => $('ls-' + s.k).oninput = draw);
    document.querySelectorAll('[data-lp]').forEach(b => b.onclick = () => { LAB.presets[+b.dataset.lp].v.forEach((x, i) => $('ls-' + LAB.sliders[i].k).value = x); draw(); });
    draw();
  }

  /* ---------- terms ---------- */
  const TERMS = cfg.TERMS || [];
  if ($('terms')) {
    let known = new Set(store.get(K + 'known', []));
    const renderTerms = () => {
      const q = ($('termSearch').value || '').toLowerCase();
      $('terms').innerHTML = `<tr><th>Begrip (NL)</th><th>EN</th><th>Betekenis</th></tr>` +
        TERMS.filter(t => !q || t.join(' ').toLowerCase().includes(q))
          .map(t => `<tr class="${known.has(t[0]) ? 'known' : ''}"><td>${t[0]}</td><td>${t[1]}</td><td>${t[2]}</td></tr>`).join('');
      $('flashCount').textContent = `✓ ${known.size} / ${TERMS.length}`;
    };
    const saveKnown = () => { store.set(K + 'known', [...known]); renderTerms(); };
    let flashCur = null, flashOpen = false;
    const drawFlash = () => {
      const [nl, ru, def] = flashCur, m = $('flashMode').value;
      const front = m === 'nl' ? `<b style="color:var(--nl)">${nl}</b>` : m === 'ru' ? `<b>${ru}</b>` : `<span>${def}</span>`;
      const back = m === 'nl' ? `${ru}<div class="sub">${def}</div>` : m === 'ru' ? `<b style="color:var(--nl)">${nl}</b><div class="sub">${def}</div>` : `<b style="color:var(--nl)">${nl}</b><div class="sub">${ru}</div>`;
      $('flash').innerHTML = flashOpen ? `<div>${front}</div><div style="margin-top:12px">${back}</div>` : `<div>${front}</div><div class="sub">${T('click to flip', 'klik om om te draaien')}</div>`;
    };
    const nextFlash = () => {
      const pool = TERMS.filter(t => !$('flashUnknown').checked || !known.has(t[0]));
      if (!pool.length) { flashCur = null; $('flash').innerHTML = '🎉 ' + T('You know all the terms!', 'Alle begrippen gekend!'); return; }
      let c; do { c = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && c === flashCur);
      flashCur = c; flashOpen = false; drawFlash();
    };
    $('termSearch').oninput = renderTerms;
    $('termReset').onclick = () => { known = new Set(); saveKnown(); nextFlash(); };
    $('flash').onclick = () => { if (flashCur) { flashOpen = !flashOpen; drawFlash(); } };
    $('flashKnown').onclick = () => { if (flashCur) { known.add(flashCur[0]); saveKnown(); } nextFlash(); };
    $('flashAgain').onclick = () => { if (flashCur) { known.delete(flashCur[0]); saveKnown(); } nextFlash(); };
    $('flashMode').onchange = () => flashCur && drawFlash();
    $('flashUnknown').onchange = nextFlash;
    renderTerms(); nextFlash();
  }

  /* ---------- test ----------
     mc:    {t, q:[nl,ru], o:[[nl,ru] | 'text'], a, e:[nl,ru]}
     order: {t, type:'order', q:[nl,en], items:[[nl,en]...] in the right order}
     open:  {t, type:'open', q:[nl,ru], model:[nl,ru], rubric:[[nl,ru],...]} */
  const Q = cfg.Q || [];
  if ($('quizBox')) {
    const QN = cfg.quizN || 12;
    let quiz = null;
    const bestText = () => { const b = store.get(K + 'best', null); return b ? T(`Best score: ${b}%`, `Beste score: ${b}%`) : ''; };
    $('quizBest').innerHTML = bestText();
    const pairNL = o => Array.isArray(o) ? `<span>${o[0]}</span><span class="ru muted"> — ${o[1]}</span>` : o;
    const qHead = (q, label) => `<div class="score">${T('Question', 'Vraag')} ${quiz.i + 1} / ${quiz.list.length} · ${T('points', 'punten')}: ${quiz.pts.toFixed(1).replace('.0', '')}</div>
        <div class="qtype">${label}</div>
        <div class="qtext">${q.q[0]}</div><div class="ru muted" style="margin-top:-6px;margin-bottom:10px">${q.q[1]}</div>`;
    const nextBtn = () => `<div class="button-row"><button class="action primary" id="qNext">${quiz.i + 1 < quiz.list.length ? T('Next →', 'Volgende →') : T('Result', 'Uitslag')}</button></div>`;
    const bindNext = () => { $('qNext').onclick = () => { quiz.i++; if (quiz.i < quiz.list.length) showQ(); else finish(); }; };
    const feedback = (ok, e) => {
      $('qMsg').innerHTML = `<div class="message ${ok ? 'ok' : 'bad'}">${ok ? '✓ ' + T('Correct', 'Goed') : '✗ ' + T('Wrong', 'Fout')}${e ? '<br>' + T(e[1], e[0]) : ''}</div>` + nextBtn();
      bindNext();
    };
    const finish = () => {
      const pct = Math.round(100 * quiz.pts / quiz.list.length);
      const cijfer = Math.max(1, Math.round((1 + 9 * quiz.pts / quiz.list.length) * 10) / 10);
      const best = store.get(K + 'best', 0); if (pct > best) store.set(K + 'best', pct);
      $('quizBest').innerHTML = bestText();
      $('quizBox').innerHTML = `<h3 style="margin-top:0">${T('Result', 'Uitslag')}: ${pct}% · ${T('grade', 'cijfer')} ≈ ${cijfer.toString().replace('.', ',')}</h3>
        <p>${pct >= 80 ? T('Excellent! Now try to explain the chain of the whole epoch out loud, without hints.', 'Uitstekend! Probeer nu de keten van het hele tijdvak hardop uit te leggen.') :
          pct >= 55 ? T('Good. Reread the sections where you made mistakes and go over the terms again.', 'Voldoende. Lees de hoofdstukken met fouten nog eens en herhaal de begrippen.') :
          T('Worth another round: start with the “Cause and effect” tab, then the terms.', 'Nog oefenen: begin bij "Oorzaak en gevolg", daarna de begrippen.')}</p>
        <div class="button-row"><button class="action primary" onclick="document.getElementById('quizStart').click()">${T('New test', 'Nieuwe toets')}</button></div>`;
    };
    const showQ = () => {
      const box = $('quizBox'), q = quiz.list[quiz.i];
      quiz.answered = false;
      if (!q.type) {
        const opts = shuffle(q.o.map((o, k) => ({ o, k })));
        box.innerHTML = qHead(q, T('choose one answer', 'meerkeuze')) +
          opts.map(x => `<button class="opt" data-k="${x.k}">${pairNL(x.o)}</button>`).join('') + `<div id="qMsg"></div>`;
        box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          if (quiz.answered) return; quiz.answered = true;
          const k = +b.dataset.k, ok = k === q.a;
          if (ok) quiz.pts++;
          box.querySelectorAll('.opt').forEach(x => { if (+x.dataset.k === q.a) x.classList.add('right'); });
          if (!ok) b.classList.add('wrong');
          feedback(ok, q.e);
        });
      } else if (q.type === 'order') {
        const items = q.items.map((it, pos) => ({ it, pos }));
        const shown = shuffle(items), picked = [];
        const draw = () => {
          box.innerHTML = qHead(q, T('order: click in sequence', 'volgorde: klik in de goede volgorde')) +
            `<div class="order-items">` + shown.map((x, i) => { const k = picked.indexOf(x); return `<button class="order-item ${k >= 0 ? 'picked' : ''}" data-i="${i}"><span class="badge">${k >= 0 ? k + 1 : ''}</span>${pairNL(x.it)}</button>`; }).join('') +
            `</div><div class="button-row"><button class="action primary" id="qOrd">${T('Check', 'Controleer')}</button></div><div id="qMsg"></div>`;
          box.querySelectorAll('.order-item').forEach(b => b.onclick = () => {
            if (quiz.answered) return;
            const x = shown[+b.dataset.i], j = picked.indexOf(x);
            if (j >= 0) picked.splice(j, 1); else picked.push(x); draw();
          });
          $('qOrd').onclick = () => {
            if (quiz.answered || picked.length < shown.length) return;
            quiz.answered = true;
            const ok = picked.every((x, i) => x.pos === i);
            if (ok) quiz.pts++;
            box.querySelectorAll('.order-item').forEach(b => { const x = shown[+b.dataset.i]; b.classList.add(picked.indexOf(x) === x.pos ? 'right' : 'wrong'); });
            feedback(ok, ok ? null : [q.items.map(x => x[0]).join(' → '), q.items.map(x => x[1]).join(' → ')]);
          };
        };
        draw();
      } else {
        box.innerHTML = qHead(q, T('open question: write your answer, then mark it yourself', 'open vraag: schrijf je antwoord en beoordeel jezelf')) +
          `<textarea id="qOpen" placeholder="Mijn antwoord / my answer…"></textarea>
           <div class="button-row"><button class="action primary" id="qShow">${T('Show model answer', 'Toon modelantwoord')}</button></div><div id="qMsg"></div>`;
        $('qShow').onclick = () => {
          $('qShow').disabled = true;
          $('qMsg').innerHTML = `<div class="message"><b>${T('Model answer', 'Modelantwoord')}:</b>${TB('<p>' + q.model[1] + '</p>', '<p>' + q.model[0] + '</p>')}
            <div class="rubric"><b>${T('Tick what is in YOUR answer:', 'Vink aan wat in JOUW antwoord staat:')}</b>
            ${q.rubric.map((r, i) => `<label><input type="checkbox" data-r="${i}"> ${pairNL(r)}</label>`).join('')}</div>
            <div class="button-row"><button class="action primary" id="qRub">${T('Done', 'Klaar')}</button></div></div>`;
          $('qRub').onclick = () => {
            if (quiz.answered) return; quiz.answered = true;
            const got = $('qMsg').querySelectorAll('input:checked').length / q.rubric.length;
            quiz.pts += got;
            $('qRub').disabled = true;
            $('qMsg').insertAdjacentHTML('beforeend', `<div class="message ${got === 1 ? 'ok' : got > 0 ? '' : 'bad'}">${T('Points for this question', 'Punten')}: ${Math.round(got * 100) / 100}</div>` + nextBtn());
            bindNext();
          };
        };
      }
    };
    $('quizStart').onclick = () => {
      const topic = $('quizTopic').value;
      const pool = Q.filter(q => topic === 'all' || q.t === topic);
      quiz = { list: shuffle(pool).slice(0, QN), i: 0, pts: 0, answered: false };
      showQ();
    };
  }
}
