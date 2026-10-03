/* ===== WaveLab Física · navegación y vistas ===== */
const view = $('#view');

/* ---- tema y modo proyector ---- */
let theme = store.get('theme', 'auto');
let big = store.get('big', false);
function applyPrefs() {
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('big', big);
  $('#bigBtn').setAttribute('aria-pressed', big);
  $('#themeBtn').title = 'Tema: ' + ({ auto: 'automático', light: 'claro', dark: 'oscuro' })[theme];
}
$('#themeBtn').onclick = () => { theme = { auto: 'light', light: 'dark', dark: 'auto' }[theme]; store.set('theme', theme); applyPrefs(); };
$('#bigBtn').onclick = () => {
  big = !big; store.set('big', big); applyPrefs();
  try { if (big && !document.fullscreenElement) document.documentElement.requestFullscreen(); else if (!big && document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
};
applyPrefs();

/* ---- utilidades de vistas ---- */
const where = id => PROGRAMS.flatMap(p => p.ejes.filter(e => e.sims.includes(id)).map(e => ({ p, e })));
const labCard = (id, href) => { const s = SIMS[id]; return `<a class="lab" href="${href}"><span class="ic">${s.icon}</span><span><strong>${esc(s.title)}</strong><small>${esc(s.short)}</small></span></a>`; };
const crumbs = list => `<nav class="crumbs">${list.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join('<span>›</span>')}</nav>`;
function setTitle(t) { document.title = t ? t + ' · WaveLab Física' : 'WaveLab Física'; }

/* ---- inicio ---- */
function showHome() {
  setTitle('');
  const n = Object.keys(SIMS).length;
  view.innerHTML = `
    <section class="hero">
      <div>
        <div class="kicker">Laboratorio virtual de Física</div>
        <h1>Experimentá con la energía, el calor, la electricidad y el universo</h1>
        <p>${n} simuladores interactivos, conceptos clave y desafíos para cada eje del programa. Funciona en la compu, el celular y el proyector del aula.</p>
        <div class="row"><a class="btn primary" href="#/labs">Ver todos los laboratorios</a><a class="btn" href="#/a">Programa A</a><a class="btn" href="#/b">Programa B</a></div>
      </div>
      <div class="hero-art" id="heroArt"></div>
    </section>
    <div class="sec-h"><h2>Programas</h2></div>
    <div class="progs">${PROGRAMS.map(p => `<a class="prog" href="#/${p.id}" style="--pc:${p.color}"><span class="kicker" style="color:${p.color}">${esc(p.name)}</span><h2>${esc(p.title)}</h2><span class="muted">${esc(p.desc)}</span><ol>${p.ejes.map(e => `<li>${esc(e.title)}</li>`).join('')}</ol></a>`).join('')}</div>
    <div class="sec-h"><h2>Laboratorios destacados</h2><a href="#/labs">Ver todos →</a></div>
    <div class="labs">${['montana', 'sol', 'circuito', 'arquimedes', 'invernadero', 'relatividad'].map(id => labCard(id, '#/lab/' + id)).join('')}</div>`;
  heroArt($('#heroArt'));
}
function heroArt(el) {
  const cv = makeCanvas(el, .625, () => { });
  let t = 0;
  animate(cv, dt => {
    t += dt; const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const px = W * .36, py = 24, L = H * .62, A = .9, th = A * Math.cos(t * 1.6);
    const bx = px + L * Math.sin(th), by = py + L * Math.cos(th);
    c.strokeStyle = cssv('--grid'); for (let x = 0; x < W; x += 28) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 28) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.strokeStyle = cssv('--ink'); c.lineWidth = 2; c.beginPath(); c.moveTo(px - 40, py); c.lineTo(px + 40, py); c.stroke();
    c.beginPath(); c.moveTo(px, py); c.lineTo(bx, by); c.stroke();
    c.fillStyle = cssv('--accent'); c.beginPath(); c.arc(bx, by, 16, 0, 7); c.fill();
    const hmax = L * (1 - Math.cos(A)), h = L * (1 - Math.cos(th));
    D.bars(c, W * .7, 20, W * .26, H - 34, [{ label: 'Ep', val: h / hmax * 100, color: cssv('--ep') }, { label: 'Ec', val: (1 - h / hmax) * 100, color: cssv('--ec') }], 100, '%');
  });
}

/* ---- programa ---- */
function showProgram(pid) {
  const p = progById(pid); if (!p) return showHome();
  setTitle(p.title);
  view.innerHTML = `${crumbs([['Inicio', '#/'], [p.name]])}
    <div class="kicker" style="color:${p.color}">${esc(p.name)}</div><h1 style="font-size:clamp(1.8rem,4vw,2.4rem)">${esc(p.title)}</h1>
    <p class="lead">${esc(p.desc)}</p>
    <div class="ejes">${p.ejes.map(e => { const best = store.get('quiz.' + p.id + e.id, null); return `<a class="eje" href="#/${p.id}/${e.id}" style="--pc:${p.color}"><span class="num">${e.id}</span><span><h3>${esc(e.title)}</h3><p>${esc(e.sub)} · ${e.sims.map(s => SIMS[s].icon).join(' ')}</p></span><span class="meta">${e.sims.length} laboratorios${best !== null ? '<br>Desafío: ' + best + '%' : ''}</span></a>`; }).join('')}</div>`;
}

/* ---- eje ---- */
function showEje(pid, eid) {
  const p = progById(pid), e = p && p.ejes.find(x => x.id === eid); if (!e) return showProgram(pid);
  setTitle(e.title);
  const best = store.get('quiz.' + p.id + e.id, null);
  const i = p.ejes.indexOf(e), prev = p.ejes[i - 1], next = p.ejes[i + 1];
  view.innerHTML = `${crumbs([['Inicio', '#/'], [p.name, '#/' + p.id], ['Eje ' + e.id]])}
    <div class="kicker" style="color:${p.color}">${esc(p.name)} · Eje ${e.id}</div>
    <h1 style="font-size:clamp(1.7rem,4vw,2.3rem)">${esc(e.title)}</h1>
    <p class="lead">${esc(e.sub)}</p>
    <div class="eje-grid">
      <div>
        <div class="sec-h"><h2>Laboratorios</h2></div>
        <div class="labs" style="margin-bottom:24px">${e.sims.map(s => labCard(s, `#/${p.id}/${e.id}/${s}`)).join('')}</div>
        <div class="sec-h"><h2>Conceptos clave</h2></div>
        <ul class="concepts">${e.concepts.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
      <aside style="display:flex;flex-direction:column;gap:16px">
        <div class="quizcta"><h3>🎯 Desafío del eje</h3><p style="margin:0">8 preguntas conceptuales y problemas con números que cambian cada vez.</p>${best !== null ? `<p style="margin:0" class="muted">Tu mejor resultado: <b>${best}%</b></p>` : ''}<a class="btn primary" href="#/${p.id}/${e.id}/quiz">Empezar desafío</a></div>
        <div class="card"><h3 style="font-size:1.1rem;margin-bottom:8px">💬 Para investigar y debatir</h3><ol class="debate">${e.debate.map(d => `<li>${esc(d)}</li>`).join('')}</ol></div>
      </aside>
    </div>
    <div class="row" style="justify-content:space-between;margin-top:24px">${prev ? `<a class="btn" href="#/${p.id}/${prev.id}">← Eje ${prev.id}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/${p.id}/${next.id}">Eje ${next.id} →</a>` : ''}</div>`;
}

/* ---- todos los laboratorios ---- */
function showLabs() {
  setTitle('Laboratorios');
  view.innerHTML = `${crumbs([['Inicio', '#/'], ['Laboratorios']])}
    <h1 style="font-size:clamp(1.8rem,4vw,2.4rem)">Todos los laboratorios</h1>
    <p class="lead">Cada simulador tiene controles para experimentar, lecturas en vivo, las fórmulas que intervienen y preguntas para pensar.</p>
    <div class="labs">${Object.keys(SIMS).map(id => labCard(id, '#/lab/' + id)).join('')}</div>`;
}

/* ---- simulador ---- */
function showSim(id, ctxPath, tabId) {
  const s = SIMS[id]; if (!s) return showLabs();
  setTitle(s.title);
  let cr, base;
  if (ctxPath) { const p = progById(ctxPath[0]), e = p.ejes.find(x => x.id === ctxPath[1]); cr = [['Inicio', '#/'], [p.name, '#/' + p.id], ['Eje ' + e.id, `#/${p.id}/${e.id}`], [s.title]]; base = `#/${p.id}/${e.id}/${id}`; }
  else { cr = [['Inicio', '#/'], ['Laboratorios', '#/labs'], [s.title]]; base = '#/lab/' + id; }
  const tabs = s.tabs || null, tab = tabs ? (tabs.find(t => t.id === tabId) || tabs[0]) : null;
  const w = where(id);
  view.innerHTML = `${crumbs(cr)}
    <div class="sim-title"><span class="ic">${s.icon}</span><h1>${esc(s.title)}</h1></div>
    <p class="lead">${esc(s.desc)}</p>
    ${tabs ? `<div class="tabs" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${t === tab}" data-t="${t.id}">${esc(t.label)}</button>`).join('')}</div>` : ''}
    <div class="sim-grid"><div class="stage"></div><aside class="panel"></aside></div>
    <div class="reads"></div>
    <div class="two">
      <div class="card formulas"><h3 style="font-size:1.1rem">📐 Fórmulas</h3>${s.formulas.map(f => `<div class="f">${esc(f[0])}${f[1] ? `<small>${esc(f[1])}</small>` : ''}</div>`).join('')}</div>
      <div class="card think"><h3 style="font-size:1.1rem;margin-bottom:8px">🤔 Para pensar</h3><ol>${s.think.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>
    </div>
    ${w.length ? `<p class="muted" style="margin-top:18px">Se usa en: ${w.map(({ p, e }) => `<a href="#/${p.id}/${e.id}">${esc(p.name)} · Eje ${e.id}</a>`).join(' · ')}</p>` : ''}`;
  $$('.tabs button').forEach(b => b.onclick = () => { location.hash = base + '/' + b.dataset.t; });
  const stage = $('.stage'), panel = $('.panel'), reads = $('.reads');
  let last = '';
  const ctx = {
    stage, panel,
    reads(items) {
      const h = items.map(([l, v, c]) => `<div class="rd"${c ? ` style="--rc:${c}"` : ''}><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('');
      if (h !== last) { reads.innerHTML = h; last = h; }
    }
  };
  (tab ? tab.mount : s.mount)(ctx);
  if (!panel.isConnected || !panel.children.length) { panel.remove(); $('.sim-grid').style.gridTemplateColumns = '1fr'; }
}

/* ---- desafío ---- */
function showQuiz(pid, eid) {
  const p = progById(pid), e = p && p.ejes.find(x => x.id === eid); if (!e) return showHome();
  setTitle('Desafío · ' + e.title);
  const qs = buildQuiz(e.quiz, 8); let i = 0, ok = 0;
  const head = `${crumbs([['Inicio', '#/'], [p.name, '#/' + p.id], ['Eje ' + e.id, `#/${p.id}/${e.id}`], ['Desafío']])}`;
  function render() {
    if (i >= qs.length) {
      const pct = Math.round(ok / qs.length * 100), key = 'quiz.' + p.id + e.id, best = store.get(key, 0);
      if (pct > best || best === null) store.set(key, pct);
      view.innerHTML = `${head}<div class="quiz"><div class="qcard score"><div class="big">${ok}/${qs.length}</div><h2>${pct >= 90 ? '¡Excelente!' : pct >= 60 ? '¡Muy bien!' : 'Seguí practicando con los laboratorios'}</h2><p class="muted">Obtuviste ${pct}%. ${pct > best ? '¡Nuevo récord!' : 'Tu mejor resultado: ' + Math.max(best, pct) + '%'}</p>
        <div class="row" style="justify-content:center;margin-top:16px"><button class="btn primary" id="again">Otro desafío</button><a class="btn" href="#/${p.id}/${e.id}">Volver al eje</a></div></div></div>`;
      $('#again').onclick = () => showQuiz(pid, eid);
      return;
    }
    const q = qs[i];
    view.innerHTML = `${head}<div class="quiz">
      <div class="qhead"><b>Pregunta ${i + 1} de ${qs.length}</b><div class="qbar"><i style="width:${i / qs.length * 100}%"></i></div><span class="muted">✔ ${ok}</span></div>
      <div class="qcard"><p class="q">${esc(q.q)}</p><div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="ex"></div></div></div>`;
    $$('.opt').forEach(b => b.onclick = () => {
      const good = q.o[+b.dataset.k] === q.ok; if (good) ok++;
      $$('.opt').forEach(x => { x.disabled = true; if (q.o[+x.dataset.k] === q.ok) x.classList.add('ok'); });
      if (!good) b.classList.add('no');
      $('#ex').innerHTML = `<div class="expl"><b>${good ? '✔ ¡Correcto!' : '✘ No es correcto.'}</b> ${esc(q.ex || '')}</div><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" id="nx">${i + 1 < qs.length ? 'Siguiente →' : 'Ver resultado'}</button></div>`;
      $('#nx').onclick = () => { i++; render(); }; $('#nx').focus();
    });
  }
  render();
}

/* ---- router ---- */
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  window.scrollTo(0, 0);
  if (!parts.length) return showHome();
  if (parts[0] === 'labs') return showLabs();
  if (parts[0] === 'lab') return showSim(parts[1], null, parts[2]);
  const p = progById(parts[0]); if (!p) return showHome();
  if (parts.length === 1) return showProgram(p.id);
  if (parts.length === 2) return showEje(p.id, parts[1]);
  if (parts[2] === 'quiz') return showQuiz(p.id, parts[1]);
  return showSim(parts[2], [p.id, parts[1]], parts[3]);
}
window.addEventListener('hashchange', route);
route();
