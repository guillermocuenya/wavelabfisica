/* ===== Simuladores: energía mecánica, potencia, rendimiento, fuentes, consumo ===== */

/* ---------- 1. Conservación de la energía mecánica ---------- */
defSim({
  id: 'montana', icon: '🎢', title: 'Conservación de la energía mecánica',
  short: 'Pista de skate y montaña rusa: Ep, Ec y calor por rozamiento',
  desc: 'Soltá el carrito desde arriba y mirá cómo la energía potencial se transforma en cinética y viceversa. Si agregás rozamiento, parte de la energía mecánica se transforma en energía térmica y ya no se puede recuperar.',
  formulas: [['Ep = m · g · h', 'energía potencial gravitatoria (h medida desde el punto más bajo)'], ['Ec = ½ · m · v²', 'energía cinética'], ['Em = Ep + Ec', 'energía mecánica'], ['Em,inicial = Em + Q', 'Q: energía transformada en calor por el rozamiento']],
  think: ['Sin rozamiento, ¿hasta qué altura llega el carrito del otro lado? ¿Por qué?', '¿Cambia la velocidad en el punto más bajo si duplicás la masa? Probalo y explicá.', 'Con rozamiento, ¿la energía "desaparece"? ¿Adónde va?', '¿Qué pasaría en la Luna? ¿Más rápido o más lento? ¿Por qué?', 'La Ep es una función de estado: ¿depende del camino que hizo el carrito o solo de dónde está?'],
  mount(ctx) {
    const L = 12;
    const TR = {
      u: { name: 'Pista de skate (U)', f: u => Math.pow(2 * u - 1, 2) },
      m: { name: 'Montaña rusa', f: u => (0.55 + 0.45 * Math.cos(3 * Math.PI * u)) * (1 - 0.5 * u) }
    };
    let S, x, v, E0, Q, t, hist, running = true;
    const yAt = xx => S.H * TR[S.pista].f(clamp(xx / L, 0, 1));
    const slope = xx => (yAt(xx + 0.001) - yAt(xx - 0.001)) / 0.002;
    const reset = () => {
      x = S.pista === 'u' ? 0.0001 : 0.3; v = 0; Q = 0; t = 0; hist = [];
      E0 = S.m * S.g * yAt(x); running = true; playBtn.textContent = '⏸ Pausa';
    };
    heading(ctx.panel, 'Parámetros');
    S = controls(ctx.panel, [
      { k: 'pista', label: 'Pista', type: 'select', val: 'u', options: [['u', TR.u.name], ['m', TR.m.name]] },
      { k: 'H', label: 'Altura inicial', min: 2, max: 10, step: .5, val: 6, unit: 'm' },
      { k: 'm', label: 'Masa', min: 20, max: 150, step: 5, val: 60, unit: 'kg' },
      { k: 'mu', label: 'Coeficiente de rozamiento μ', min: 0, max: .3, step: .01, val: 0, d: 2 },
      { k: 'g', label: 'Gravedad', type: 'select', val: 9.8, options: [[9.8, 'Tierra (9,8 m/s²)'], [1.62, 'Luna (1,62 m/s²)'], [3.71, 'Marte (3,71 m/s²)'], [24.8, 'Júpiter (24,8 m/s²)']] }
    ], () => reset());
    const br = buttons(ctx.panel, [['⏸ Pausa', b => { running = !running; b.textContent = running ? '⏸ Pausa' : '▶ Seguir'; }, 'primary'], ['↺ Reiniciar', () => reset()]]);
    const playBtn = br.firstChild;
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .52, draw);
    const gr = makeCanvas(ctx.stage, w => w < 600 ? .45 : .26, drawGraph);
    reset();

    function step(dt) {
      if (!running) return;
      const n = 25, h = dt / n, g = S.g, m = S.m;
      for (let i = 0; i < n; i++) {
        const sl = slope(x), c = 1 / Math.sqrt(1 + sl * sl), s = sl * c;
        if (v === 0 && Math.abs(s) <= S.mu * c + 1e-4) { break; } // en reposo (rozamiento estático)
        const sgn = v !== 0 ? Math.sign(v) : -Math.sign(s);
        const a = -g * s - S.mu * g * c * sgn;
        let vn = v + a * h;
        const xn = x + vn * c * h;
        const ds = Math.abs(vn) * h;
        const Qn = Q + S.mu * m * g * c * ds;
        let xx = xn;
        if (xx < 0) { xx = 0; vn = Math.abs(vn); }
        if (xx > L) { xx = L; vn = -Math.abs(vn); }
        const KE = E0 - Qn - m * g * yAt(xx);
        if (KE <= 0) { v = 0; continue; } // punto de retorno
        x = xx; Q = Qn; v = (Math.sign(vn) || 1) * Math.sqrt(2 * KE / m);
      }
      t += dt;
      if (!hist.length || t - hist[hist.length - 1].t > .05) {
        const ep = S.m * S.g * yAt(x), ec = .5 * S.m * v * v;
        hist.push({ t, ep, ec, q: Q }); if (hist.length > 600) hist.shift();
      }
    }
    function draw() {
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const narrow = W < 600;
      const tw = narrow ? W : W * .66, th = narrow ? H * .62 : H;
      const pad = 26, maxH = 10;
      const sx = (tw - pad * 2) / L, sy = (th - pad * 2) / maxH, sc = Math.min(sx, sy * 1.6);
      const X = xx => pad + xx * sx, Y = yy => th - pad - yy * Math.min(sy, sc);
      // suelo y regla de alturas
      c.strokeStyle = cssv('--grid'); c.lineWidth = 1;
      for (let hh = 0; hh <= maxH; hh += 2) { c.beginPath(); c.moveTo(pad, Y(hh)); c.lineTo(tw - pad, Y(hh)); c.stroke(); D.text(c, hh + ' m', pad - 4, Y(hh), { align: 'right', size: 10, color: cssv('--muted') }); }
      // pista
      c.beginPath(); for (let i = 0; i <= 200; i++) { const xx = L * i / 200; i ? c.lineTo(X(xx), Y(yAt(xx))) : c.moveTo(X(xx), Y(yAt(xx))); }
      c.lineTo(X(L), Y(0)); c.lineTo(X(0), Y(0)); c.closePath();
      c.fillStyle = cssv('--soft'); c.fill();
      c.beginPath(); for (let i = 0; i <= 200; i++) { const xx = L * i / 200; i ? c.lineTo(X(xx), Y(yAt(xx))) : c.moveTo(X(xx), Y(yAt(xx))); }
      c.strokeStyle = cssv('--ink'); c.lineWidth = 4; c.stroke();
      // altura inicial
      c.setLineDash([5, 5]); c.strokeStyle = cssv('--ep'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(pad, Y(S.H)); c.lineTo(tw - pad, Y(S.H)); c.stroke(); c.setLineDash([]);
      D.text(c, 'altura inicial', tw - pad, Y(S.H) - 9, { align: 'right', size: 11, color: cssv('--ep'), weight: 600 });
      // carrito
      const sl = slope(x), ang = Math.atan2(-sl * Math.min(sy, sc), sx);
      c.save(); c.translate(X(x), Y(yAt(x))); c.rotate(ang);
      c.fillStyle = cssv('--ec'); D.rrect(c, -16, -24, 32, 18, 5); c.fill();
      c.fillStyle = cssv('--ink'); c.beginPath(); c.arc(-9, -4, 4, 0, 7); c.arc(9, -4, 4, 0, 7); c.fill();
      c.restore();
      // vector velocidad
      const vx = Math.cos(ang) * v * 6, vy = Math.sin(ang) * v * 6;
      if (Math.abs(v) > .2) D.arrow(c, X(x), Y(yAt(x)) - 30, X(x) + vx, Y(yAt(x)) - 30 + vy, cssv('--ec'), 2.5);
      // barras de energía
      const ep = S.m * S.g * yAt(x), ec = .5 * S.m * v * v;
      const bx = narrow ? 30 : tw + 10, by = narrow ? th + 8 : 16, bw = narrow ? W - 50 : W - tw - 26, bh = narrow ? H - th - 10 : H - 30;
      D.bars(c, bx, by, bw, bh, [{ label: 'Ep', val: ep, color: cssv('--ep') }, { label: 'Ec', val: ec, color: cssv('--ec') }, { label: 'Calor', val: Q, color: cssv('--eq') }, { label: 'Total', val: ep + ec + Q, color: cssv('--muted') }], E0 * 1.0001, 'J');
      ctx.reads([
        ['Altura', fu(yAt(x), 'm', 2), cssv('--ep')], ['Velocidad', fu(Math.abs(v), 'm/s', 2) + ' · ' + fmt(Math.abs(v) * 3.6, 0) + ' km/h', cssv('--ec')],
        ['Energía potencial', fu(ep, 'J', 0), cssv('--ep')], ['Energía cinética', fu(ec, 'J', 0), cssv('--ec')],
        ['Energía mecánica', fu(ep + ec, 'J', 0)], ['Calor por rozamiento', fu(Q, 'J', 0), cssv('--eq')]
      ]);
    }
    function drawGraph() {
      const c = gr.ctx; D.clear(gr);
      const t1 = Math.max(10, hist.length ? hist[hist.length - 1].t : 10), t0 = Math.max(0, t1 - 30);
      D.plot(c, { x: 54, y: 22, w: gr.w - 70, h: gr.h - 52 }, [
        { pts: hist.map(p => [p.t, p.ep]), color: cssv('--ep'), label: 'Ep' },
        { pts: hist.map(p => [p.t, p.ec]), color: cssv('--ec'), label: 'Ec' },
        { pts: hist.map(p => [p.t, p.q]), color: cssv('--eq'), label: 'Calor' },
        { pts: hist.map(p => [p.t, p.ep + p.ec]), color: cssv('--ink'), label: 'Em', dash: [6, 4], w: 1.5 }
      ], { x0: t0, x1: t1, y0: 0, y1: E0 * 1.05 || 1, xl: 'tiempo (s)', yl: 'Energía (J)', legend: true });
    }
    animate(cv, dt => { step(dt); draw(); drawGraph(); });
  }
});

/* ---------- 2. Trabajo y potencia ---------- */
defSim({
  id: 'potencia', icon: '🏗️', title: 'Trabajo y potencia',
  short: 'Una grúa levanta una carga: trabajo, potencia y rendimiento del motor',
  desc: 'La potencia mide qué tan rápido se transfiere o transforma la energía. Una grúa que sube la misma carga en menos tiempo necesita más potencia. El motor además tiene un rendimiento: parte de la energía eléctrica se pierde como calor.',
  formulas: [['W = F · d = m · g · h', 'trabajo para subir una carga a velocidad constante'], ['P = W / t', 'potencia en watts (W = J/s)'], ['P eléctrica = P útil / η', 'η: rendimiento del motor'], ['1 HP ≈ 746 W · 1 kWh = 3 600 000 J', 'equivalencias']],
  think: ['Si subís la escalera corriendo, ¿hacés más trabajo que subiendo despacio? ¿Y más potencia?', '¿Qué potencia desarrollás vos subiendo las escaleras de la escuela? Medí el tiempo y la altura.', '¿Por qué un motor eléctrico se calienta?', 'Compará la potencia de la grúa con la de una pava eléctrica.'],
  tabs: [
    { id: 'grua', label: '🏗️ Grúa', mount: gruaMount },
    { id: 'vos', label: '🏃 Tu potencia', mount: vosMount }
  ]
});
const P_REFS = [['Lámpara LED', 9], ['Celular cargando', 15], ['Heladera', 150], ['Persona en la escalera', 300], ['Pava eléctrica', 2000], ['Auto chico', 70000], ['Aerogenerador', 3e6], ['Central Embalse', 6.5e8]];
function drawPowerCompare(c, x, y, w, h, P, label) {
  const items = [...P_REFS, [label, P]].sort((a, b) => a[1] - b[1]);
  const lo = 0, hi = 9; const rowH = h / items.length;
  items.forEach(([n, p], i) => {
    const yy = y + i * rowH, me = n === label;
    const bw = clamp((Math.log10(Math.max(p, 1)) - lo) / (hi - lo), 0, 1) * (w - 150 - 64);
    c.fillStyle = me ? cssv('--ec') : cssv('--soft'); D.rrect(c, x + 150, yy + 3, Math.max(bw, 3), rowH - 6, 4); c.fill();
    D.text(c, n, x + 144, yy + rowH / 2, { align: 'right', size: 11, weight: me ? 700 : 500, color: me ? cssv('--ink') : cssv('--muted') });
    D.text(c, fmtW(p), x + 156 + Math.max(bw, 3), yy + rowH / 2, { size: 11, weight: 700 });
  });
}
function fmtW(p) { return p >= 1e6 ? fmt(p / 1e6, 1) + ' MW' : p >= 1e3 ? fmt(p / 1e3, 1) + ' kW' : fmt(p, 0) + ' W'; }
function gruaMount(ctx) {
  heading(ctx.panel, 'Parámetros');
  let tt = 0;
  const S = controls(ctx.panel, [
    { k: 'm', label: 'Masa de la carga', min: 10, max: 2000, step: 10, val: 500, unit: 'kg' },
    { k: 'h', label: 'Altura', min: 1, max: 40, step: 1, val: 20, unit: 'm' },
    { k: 't', label: 'Tiempo de subida', min: 2, max: 60, step: 1, val: 20, unit: 's' },
    { k: 'eta', label: 'Rendimiento del motor', min: 40, max: 100, step: 1, val: 80, unit: '%' }
  ], () => { tt = 0; });
  const cv = makeCanvas(ctx.stage, w => w < 600 ? 1.1 : .5, () => { });
  animate(cv, dt => {
    tt = (tt + dt) % (S.t + 2);
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const narrow = W < 600, gw = narrow ? W : W * .38, gh = narrow ? H * .5 : H;
    const top = 30, base = gh - 20, x0 = gw * .25;
    // grúa
    c.strokeStyle = cssv('--ink'); c.lineWidth = 5; c.beginPath(); c.moveTo(x0, base); c.lineTo(x0, top); c.lineTo(gw - 16, top); c.stroke();
    c.fillStyle = cssv('--muted'); c.fillRect(x0 - 20, base, 40, 8);
    const hx = gw * .72, frac = clamp(tt / S.t, 0, 1), maxPx = base - top - 70, yb = base - 26 - frac * maxPx;
    c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx, top); c.lineTo(hx, yb - 13); c.stroke();
    c.fillStyle = cssv('--ec'); c.fillRect(hx - 22, yb - 13, 44, 28);
    D.text(c, fmt(S.m, 0) + ' kg', hx, yb + 1, { align: 'center', size: 11, weight: 700, color: '#fff' });
    D.text(c, 'h = ' + fmt(frac * S.h, 1) + ' m', 8, top, { size: 12, weight: 600 });
    // comparación
    const P = S.m * G * S.h / S.t;
    if (narrow) drawPowerCompare(c, 0, gh + 10, W, H - gh - 14, P, 'Esta grúa');
    else drawPowerCompare(c, gw + 10, 14, W - gw - 14, H - 24, P, 'Esta grúa');
    const W_ = S.m * G * S.h, Pe = P / (S.eta / 100);
    ctx.reads([['Trabajo realizado', fu(W_, 'J', 0)], ['Potencia útil', fmtW(P) + ' · ' + fmt(P / 746, 1) + ' HP', cssv('--ec')], ['Potencia eléctrica', fmtW(Pe)], ['Pérdidas (calor)', fmtW(Pe - P), cssv('--eq')], ['Energía consumida', fu(Pe * S.t / 3.6e6, 'kWh', 4)]]);
  });
}
function vosMount(ctx) {
  heading(ctx.panel, 'Medí tu potencia');
  html(ctx.panel, 'Contá los escalones, medí la altura de uno y tomá el tiempo con el celular.', 'info');
  const S = controls(ctx.panel, [
    { k: 'm', label: 'Tu masa', min: 30, max: 120, step: 1, val: 60, unit: 'kg' },
    { k: 'n', label: 'Cantidad de escalones', min: 5, max: 80, step: 1, val: 20, d: 0 },
    { k: 'e', label: 'Altura de cada escalón', min: .12, max: .22, step: .01, val: .17, unit: 'm' },
    { k: 't', label: 'Tiempo', min: 2, max: 60, step: .5, val: 8, unit: 's' }
  ], () => draw());
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .45, () => draw());
  function draw() {
    if (!S) return;
    const c = cv.ctx; D.clear(cv);
    const h = S.n * S.e, W_ = S.m * G * h, P = W_ / S.t;
    drawPowerCompare(c, 0, 10, cv.w, cv.h - 20, P, 'Vos');
    ctx.reads([['Altura total', fu(h, 'm', 2)], ['Trabajo (contra el peso)', fu(W_, 'J', 0)], ['Tu potencia', fmtW(P) + ' · ' + fmt(P / 746, 2) + ' HP', cssv('--ec')], ['Lámparas LED de 9 W que podrías encender', fmt(Math.floor(P / 9), 0)]]);
  }
  draw();
}

/* ---------- 3. Cadena de transformaciones y rendimiento ---------- */
const GEN_OPTS = {
  ccgt: { n: 'Central térmica de ciclo combinado (gas)', eta: .55, from: 'química (gas natural)', loss: 'calor en chimeneas y torres de enfriamiento' },
  tv: { n: 'Central térmica de vapor', eta: .35, from: 'química (gas o fueloil)', loss: 'calor en el condensador y chimenea' },
  nuc: { n: 'Central nuclear', eta: .33, from: 'nuclear (uranio)', loss: 'calor cedido al agua del lago o río' },
  hidro: { n: 'Central hidroeléctrica', eta: .88, from: 'potencial gravitatoria del agua', loss: 'rozamientos y turbulencia' },
  eol: { n: 'Aerogenerador', eta: .40, from: 'cinética del viento', loss: 'viento que sigue de largo y rozamientos' },
  fv: { n: 'Panel solar fotovoltaico', eta: .20, from: 'radiante (luz solar)', loss: 'calentamiento del panel y luz reflejada' }
};
const USE_OPTS = {
  led: { n: 'Lámpara LED', eta: .35, to: 'luz', loss: 'calor' },
  inc: { n: 'Lámpara incandescente', eta: .05, to: 'luz', loss: 'calor (¡95 %!)' },
  motor: { n: 'Motor eléctrico (ventilador, lavarropas)', eta: .85, to: 'movimiento', loss: 'calor y ruido' },
  pava: { n: 'Pava eléctrica', eta: .90, to: 'calentar el agua', loss: 'calor al ambiente' },
  cel: { n: 'Cargador de celular', eta: .80, to: 'energía química en la batería', loss: 'calor en el cargador' }
};
defSim({
  id: 'sankey', icon: '🔀', title: 'Transformaciones de la energía y rendimiento',
  short: 'Diagrama de flujo de energía: de la fuente a tu casa',
  desc: 'Armá la cadena: una central transforma una fuente primaria en electricidad (fuente secundaria), la red la transporta y un artefacto la usa. En cada paso, parte de la energía se degrada en calor. El ancho de cada flecha es proporcional a la energía.',
  formulas: [['η = E útil / E consumida', 'rendimiento de cada etapa (entre 0 y 1)'], ['η total = η₁ · η₂ · η₃', 'en una cadena, los rendimientos se multiplican'], ['E consumida = E útil + E degradada', 'la energía se conserva: lo que no es útil se va como calor']],
  think: ['¿Por qué el rendimiento total es siempre menor que el de cada etapa?', '¿Cuánta energía de gas hace falta para obtener la luz de una lámpara LED? ¿Y de una incandescente?', '¿Por qué se transporta la electricidad en alta tensión?', 'La energía "degradada" no desaparece. ¿Por qué no podemos volver a usarla?'],
  mount(ctx) {
    heading(ctx.panel, 'Armá la cadena');
    const S = controls(ctx.panel, [
      { k: 'g', label: '1. Central (fuente primaria → electricidad)', type: 'select', val: 'ccgt', options: Object.entries(GEN_OPTS).map(([k, v]) => [k, v.n]) },
      { k: 'tr', label: '2. Transporte y distribución (≈ 13 % de pérdidas)', type: 'check', val: true },
      { k: 'u', label: '3. Uso final', type: 'select', val: 'led', options: Object.entries(USE_OPTS).map(([k, v]) => [k, v.n]) }
    ], () => draw());
    html(ctx.panel, 'Valores típicos aproximados. Cada equipo real tiene su propio rendimiento.', 'muted');
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .45, () => draw());
    const legend = html(ctx.stage, '', 'info');
    function draw() {
      if (!S) return;
      const g = GEN_OPTS[S.g], u = USE_OPTS[S.u];
      const stages = [{ n: g.n, eta: g.eta, loss: g.loss }];
      if (S.tr) stages.push({ n: 'Red de transporte y distribución', eta: .87, loss: 'efecto Joule en los cables' });
      stages.push({ n: u.n, eta: u.eta, loss: u.loss });
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const n = stages.length, x0 = 16, seg = (W - 32) / (n + .6), top = 44, bot = H - 26;
      const scale = Math.min((bot - top) * .5, seg * .85) / 100;
      const X = i => x0 + (i + 1) * seg;
      let val = 100;
      // banda de entrada
      c.fillStyle = cssv('--ep'); c.globalAlpha = .9; c.fillRect(x0, top, X(0) - x0, 100 * scale); c.globalAlpha = 1;
      D.text(c, '100', x0 + 6, top + 50 * scale, { size: 13, weight: 700, color: '#fff' });
      const rows = [];
      stages.forEach((s, i) => {
        const out = val * s.eta, lost = val - out, wOut = out * scale, wIn = val * scale, wL = lost * scale, x = X(i);
        // pérdida: baja desde el nodo hasta el piso
        c.fillStyle = cssv('--eq'); c.globalAlpha = .85;
        c.beginPath(); c.moveTo(x, top + wOut); c.quadraticCurveTo(x + wL, top + wOut, x + wL, bot); c.lineTo(x, bot); c.lineTo(x, top + wIn); c.closePath(); c.fill();
        // útil: sigue hacia la derecha
        c.fillStyle = i === n - 1 ? cssv('--ok') : cssv('--ep'); c.globalAlpha = .9;
        c.fillRect(x, top, (i === n - 1 ? seg * .55 : seg), wOut); c.globalAlpha = 1;
        // nodo
        c.fillStyle = cssv('--ink'); c.fillRect(x - 2, top - 6, 4, wIn + 12);
        c.beginPath(); c.arc(x, top - 20, 12, 0, 7); c.fill();
        D.text(c, String(i + 1), x, top - 19, { align: 'center', weight: 700, color: cssv('--bg') });
        D.text(c, Math.round(s.eta * 100) + ' %', x + 16, top - 19, { size: 12, weight: 700 });
        D.text(c, '−' + fmt(lost, 1), x + Math.max(wL, 0) / 2, bot + 14, { align: 'center', size: 12, weight: 700, color: cssv('--eq') });
        rows.push(`<b>${i + 1}. ${esc(s.n)}</b> · rendimiento ${Math.round(s.eta * 100)} % · se pierde: ${esc(s.loss)}`);
        val = out;
      });
      const xe = X(n - 1) + seg * .55;
      D.text(c, 'útil: ' + fmt(val, 1), Math.min(X(n - 1) + 8, W - 80), top + val * scale + 16, { size: 14, weight: 700, color: cssv('--ok') });
      legend.innerHTML = `<b>Entrada:</b> 100 unidades de energía ${esc(g.from)}<br>${rows.join('<br>')}<br><b style="color:var(--ok)">Útil al final:</b> ${fmt(val, 1)} unidades para ${esc(u.to)}`;
      ctx.reads([['Rendimiento total', fmt(val, 1) + ' %', cssv('--ok')], ['Energía degradada en calor', fmt(100 - val, 1) + ' %', cssv('--eq')], ['Para 1 J útil hay que extraer', fu(100 / val, 'J', 1), cssv('--ep')]]);
    }
    draw();
  }
});

/* ---------- 4. Fuentes de energía ---------- */
const SOURCES = [
  ['☀️', 'Radiación solar', 'pr', 'Se aprovecha con paneles fotovoltaicos y colectores térmicos. No emite gases al usarse, pero fabricar y desechar paneles tiene impacto.'],
  ['💨', 'Viento', 'pr', 'Mueve aerogeneradores. Argentina tiene un recurso excelente en la Patagonia y en el sur de Buenos Aires.'],
  ['💧', 'Agua de un río (hidráulica)', 'pr', 'Represas como Yacyretá o El Chocón. Es renovable, pero las represas inundan grandes superficies y alteran los ríos.'],
  ['🌽', 'Biomasa (rastrojo, estiércol)', 'pr', 'En la región de Río Cuarto se producen bioetanol y biogás a partir del maíz y de residuos agroindustriales.'],
  ['🌋', 'Calor interno de la Tierra', 'pr', 'Energía geotérmica. En Neuquén (Copahue) hay recurso geotérmico.'],
  ['🌊', 'Mareas', 'pr', 'Energía mareomotriz. La costa patagónica tiene mareas muy grandes, aunque todavía no se aprovechan a gran escala.'],
  ['🪵', 'Leña', 'pr', 'Es renovable solo si se reforesta. Quemarla emite CO₂ y humo.'],
  ['🔥', 'Gas natural', 'pn', 'La fuente más usada en Argentina. Gran parte se extrae de Vaca Muerta (Neuquén). Al quemarse emite CO₂.'],
  ['🛢️', 'Petróleo crudo', 'pn', 'Se formó durante millones de años. De él se obtienen nafta, gasoil y plásticos.'],
  ['⚫', 'Carbón mineral', 'pn', 'Argentina lo extrae en Río Turbio (Santa Cruz). Es el combustible que más CO₂ emite por unidad de energía.'],
  ['☢️', 'Uranio', 'pn', 'Combustible de las centrales nucleares, como Embalse (Córdoba). No emite CO₂, pero genera residuos radiactivos que deben guardarse por siglos.'],
  ['⚡', 'Electricidad', 's', 'Se obtiene transformando otras fuentes en las centrales. Es muy práctica para transportar y usar.'],
  ['⛽', 'Nafta', 's', 'Se obtiene refinando petróleo crudo.'],
  ['🚛', 'Gasoil', 's', 'Se obtiene refinando petróleo crudo. Lo usan camiones, tractores y colectivos.'],
  ['🧪', 'Hidrógeno', 's', 'No está libre en la naturaleza: se produce con electricidad o gas. Es un "vector" energético.'],
  ['🌾', 'Bioetanol', 's', 'Se fabrica a partir del maíz o la caña de azúcar y se mezcla con la nafta.'],
  ['🫙', 'Gas envasado (garrafa)', 's', 'Se obtiene del procesamiento del gas natural y del petróleo.'],
  ['♨️', 'Carbón vegetal', 's', 'Se obtiene quemando leña con poco aire. ¡El del asado es una fuente secundaria!']
];
const CATS = { pr: 'Primaria renovable', pn: 'Primaria no renovable', s: 'Secundaria' };
const MATRICES = {
  mundo: { n: 'Mundo · energía primaria 2023', src: 'Energy Institute, Statistical Review of World Energy 2024', d: [['Petróleo', 31.7, 0], ['Carbón', 26.5, 0], ['Gas natural', 23.3, 0], ['Hidráulica', 6.4, 1], ['Nuclear', 4.0, 0], ['Eólica, solar y otras renovables', 8.2, 1]] },
  arg: { n: 'Argentina · energía primaria 2023', src: 'Argendata (Fundar), sobre datos de la Secretaría de Energía', d: [['Gas natural', 44, 0], ['Petróleo', 38, 0], ['Hidráulica', 8, 1], ['Eólica', 3.7, 1], ['Nuclear', 2, 0], ['Bioenergía', 1.3, 1], ['Carbón', 1, 0], ['Solar', .8, 1]] },
  elec: { n: 'Argentina · generación eléctrica 2025', src: 'CAMMESA, Informe Anual 2025', d: [['Térmica (gas y otros fósiles)', 52.7, 0], ['Hidráulica', 21.1, 1], ['Renovables (eólica, solar, bio)', 18.7, 1], ['Nuclear', 7.5, 0]] }
};
const MCOL = { 'Petróleo': '#8a5a2b', 'Carbón': '#4b4f58', 'Gas natural': '#e8803a', 'Hidráulica': '#2f7fd6', 'Nuclear': '#9b59d0', 'Eólica, solar y otras renovables': '#2bb673', 'Eólica': '#2bb673', 'Bioenergía': '#7ab648', 'Solar': '#f2b51b', 'Térmica (gas y otros fósiles)': '#e8803a', 'Renovables (eólica, solar, bio)': '#2bb673' };
defSim({
  id: 'matriz', icon: '🌎', title: 'Fuentes de energía y matriz energética',
  short: 'Clasificá fuentes y explorá la matriz del mundo, Argentina y Córdoba',
  desc: 'Las fuentes primarias están en la naturaleza; las secundarias se obtienen transformándolas. Algunas primarias se renuevan a escala humana y otras no. ¿De dónde sale la energía que usamos?',
  formulas: [['Fuente primaria → (transformación) → fuente secundaria', 'ej.: petróleo → refinería → nafta'], ['% renovable = Σ renovables / total', 'participación en la matriz']],
  think: ['¿Por qué la electricidad no es una fuente primaria?', '¿Qué fuente domina la matriz argentina? ¿Qué ventajas y problemas tiene?', 'Compará la matriz argentina con la mundial. ¿Cuál usa más carbón?', '¿Qué centrales hay en Córdoba? ¿Cuál está más cerca de Río Cuarto?', 'Elegí una fuente y analizá su impacto ambiental en todo su ciclo de vida.'],
  tabs: [
    { id: 'clasificar', label: '🃏 Clasificar', mount: clasifMount },
    { id: 'matrices', label: '🍩 Matrices', mount: matrizMount },
    { id: 'cba', label: '📍 Córdoba', mount: cbaMount }
  ]
});
function clasifMount(ctx) {
  ctx.stage.innerHTML = ''; ctx.panel.innerHTML = '';
  let deck = shuffle(SOURCES).slice(0, 10), i = 0, ok = 0;
  heading(ctx.panel, '¿Cómo se juega?');
  html(ctx.panel, 'Aparece una fuente de energía. Tocá la categoría correcta. Son 10 cartas.', 'info');
  const area = html(ctx.stage, '', 'deck');
  function show() {
    if (i >= deck.length) {
      area.innerHTML = `<div class="score"><div class="big">${ok}/${deck.length}</div><p>${ok >= 9 ? '¡Excelente!' : ok >= 6 ? '¡Muy bien!' : 'Revisá las diferencias y probá otra vez.'}</p><button class="btn primary" id="again">Jugar otra vez</button></div>`;
      $('#again', area).onclick = () => { deck = shuffle(SOURCES).slice(0, 10); i = 0; ok = 0; show(); };
      ctx.reads([['Aciertos', ok + ' de ' + deck.length, cssv('--ok')]]);
      return;
    }
    const [e, n, cat, info] = deck[i];
    area.innerHTML = `<div class="muted">Carta ${i + 1} de ${deck.length}</div><div class="srccard"><span class="e">${e}</span>${esc(n)}</div>
      <div class="bins">${Object.entries(CATS).map(([k, v]) => `<button data-k="${k}">${v}</button>`).join('')}</div><div id="fb" style="width:100%"></div>`;
    $$('.bins button', area).forEach(b => b.onclick = () => {
      const good = b.dataset.k === cat; if (good) ok++;
      $$('.bins button', area).forEach(x => { x.disabled = true; if (x.dataset.k === cat) x.style.borderColor = cssv('--ok'); });
      if (!good) b.style.borderColor = cssv('--bad');
      $('#fb', area).innerHTML = `<div class="alert ${good ? 'ok' : 'bad'}">${good ? '¡Correcto!' : 'Es ' + CATS[cat].toLowerCase() + '.'}</div><p>${esc(info)}</p><button class="btn primary" id="nx">Siguiente →</button>`;
      $('#nx', area).onclick = () => { i++; show(); };
      ctx.reads([['Aciertos', ok + ' de ' + (i + 1), cssv('--ok')]]);
    });
  }
  show();
}
function matrizMount(ctx) {
  heading(ctx.panel, 'Matriz');
  const S = controls(ctx.panel, [{ k: 'm', label: 'Elegí la matriz', type: 'select', val: 'arg', options: Object.entries(MATRICES).map(([k, v]) => [k, v.n]) }], () => draw());
  const note = html(ctx.panel, '', 'muted');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? 1.15 : .55, () => draw());
  function draw() {
    if (!S) return;
    const M = MATRICES[S.m], c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const narrow = W < 600, R = narrow ? W * .3 : Math.min(H * .42, W * .22), cx = narrow ? W / 2 : R + 30, cy = narrow ? R + 20 : H / 2;
    const tot = M.d.reduce((a, b) => a + b[1], 0); let a0 = -Math.PI / 2;
    M.d.forEach(([n, v]) => {
      const a1 = a0 + v / tot * Math.PI * 2;
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath(); c.fillStyle = MCOL[n] || '#888'; c.fill();
      c.strokeStyle = cssv('--card'); c.lineWidth = 2; c.stroke(); a0 = a1;
    });
    c.beginPath(); c.arc(cx, cy, R * .55, 0, 7); c.fillStyle = cssv('--card'); c.fill();
    const ren = M.d.filter(d => d[2]).reduce((a, b) => a + b[1], 0);
    D.text(c, fmt(ren, 1) + ' %', cx, cy - 8, { align: 'center', size: 22, weight: 700, font: 'Space Grotesk, sans-serif', color: '#2bb673' });
    D.text(c, 'renovable', cx, cy + 14, { align: 'center', size: 12, color: cssv('--muted') });
    const lx = narrow ? 16 : cx + R + 40; let ly = narrow ? cy + R + 30 : cy - M.d.length * 14;
    M.d.forEach(([n, v, r]) => {
      c.fillStyle = MCOL[n] || '#888'; D.rrect(c, lx, ly - 7, 14, 14, 3); c.fill();
      D.text(c, n + (r ? ' ♻' : ''), lx + 22, ly, { size: 13, weight: 600 });
      D.text(c, fmt(v, 1) + ' %', narrow ? W - 16 : lx + 300, ly, { size: 13, weight: 700, align: 'right' });
      ly += 28;
    });
    note.textContent = 'Fuente: ' + M.src + '. ♻ = renovable.';
    ctx.reads([['Renovable', fmt(ren, 1) + ' %', '#2bb673'], ['No renovable', fmt(tot - ren, 1) + ' %', '#e8803a'], ['Fuente principal', M.d[0][0] + ' (' + fmt(M.d[0][1], 1) + ' %)']]);
  }
  draw();
}
function cbaMount(ctx) {
  ctx.stage.innerHTML = '';
  heading(ctx.panel, 'Córdoba en el sistema eléctrico');
  html(ctx.panel, 'Córdoba no tiene yacimientos de gas ni de petróleo: los recibe por gasoductos y oleoductos desde otras provincias. Está conectada al Sistema Argentino de Interconexión (SADI), que une centrales y consumos de casi todo el país.', 'info');
  const P = [
    ['☢️', 'Central Nuclear Embalse', 'Embalse, valle de Calamuchita · nuclear · ≈ 650 MW', 'Usa uranio natural y agua pesada. Se enfría con el agua del lago del embalse de Río Tercero.'],
    ['💧', 'Complejo Hidroeléctrico Río Grande', 'Calamuchita · hidráulica de bombeo · ≈ 750 MW', 'Cuando sobra energía bombea agua hacia arriba; en los picos de demanda la deja caer por las turbinas. Funciona como una gran batería.'],
    ['💧', 'Centrales de los diques serranos', 'San Roque, Los Molinos, Río Tercero, Cruz del Eje y otros · hidráulica', 'Pequeñas y medianas centrales en los embalses de las sierras.'],
    ['🔥', 'Centrales térmicas', 'Pilar (ciclo combinado) y otras · gas natural', 'Queman gas que llega por gasoducto. Son las que más energía aportan, pero emiten CO₂.'],
    ['🌽', 'Bioenergía en el sur provincial', 'Región de Río Cuarto · bioetanol y biogás', 'Aprovechan el maíz y residuos agroindustriales. El biogás se usa para generar electricidad.'],
    ['☀️', 'Solar y generación distribuida', 'Toda la provincia', 'Parques solares y "usuarios-generadores": casas, escuelas y empresas con paneles que inyectan energía a la red.']
  ];
  html(ctx.stage, `<div class="plants">${P.map(p => `<div class="plant"><strong>${p[0]} ${esc(p[1])}</strong><small>${esc(p[2])}</small><p style="margin:6px 0 0;font-size:.92rem">${esc(p[3])}</p></div>`).join('')}</div>`);
  ctx.reads([['Fuente principal en la red argentina', 'Térmica (gas)'], ['Energía de bombeo en Córdoba', 'Río Grande']]);
}

/* ---------- 5. Consumo de energía en casa ---------- */
const APPS_DEF = [
  ['Heladera con freezer', 45, 24, 1], ['Lámparas LED', 9, 6, 6], ['Televisor LED', 80, 4, 1], ['Lavarropas automático', 600, .7, 1],
  ['Pava eléctrica', 2000, .3, 1], ['Aire acondicionado (frío)', 1200, 3, 1], ['Computadora', 100, 3, 1], ['Cargador de celular', 10, 3, 2],
  ['Microondas', 1000, .25, 1], ['Router WiFi', 10, 24, 1], ['Aparatos en stand-by', 15, 24, 1]
];
defSim({
  id: 'consumo', icon: '🏠', title: 'Consumo de energía en casa',
  short: 'Calculá los kWh de tu casa y leé el medidor',
  desc: 'La boleta de luz cobra la energía en kilowatt-hora (kWh). Cargá los artefactos de tu casa con su potencia y las horas de uso, y compará el resultado con lo que marca el medidor.',
  formulas: [['E (kWh) = P (W) · t (h) / 1000', 'energía consumida'], ['E mensual ≈ E diaria · 30', ''], ['Costo ≈ E · precio por kWh', 'sin impuestos ni cargos fijos']],
  think: ['¿Qué artefacto consume más energía en tu casa: el que tiene más potencia o el que está más horas prendido?', 'Medí tu consumo real con el medidor durante una semana. ¿Se parece al cálculo?', '¿Cuánto se ahorra cambiando 6 lámparas incandescentes de 60 W por LED de 9 W?', '¿Por qué la demanda eléctrica del país es mayor en verano a la tarde y en invierno a la noche?'],
  tabs: [
    { id: 'art', label: '🔌 Mis artefactos', mount: artMount },
    { id: 'med', label: '📟 Leer el medidor', mount: medMount },
    { id: 'curva', label: '📈 Demanda del país', mount: curvaMount }
  ]
});
function artMount(ctx) {
  let apps = store.get('apps', null) || APPS_DEF.map(a => [...a]);
  let price = store.get('price', '');
  heading(ctx.panel, 'Precio de la energía');
  const pr = html(ctx.panel, `<div class="ctl"><label for="kwhp">Precio por kWh (mirá tu boleta)</label><input type="number" id="kwhp" min="0" step="any" placeholder="Ej.: 150" value="${price}"></div>`);
  buttons(ctx.panel, [['+ Agregar artefacto', () => { apps.push(['Nuevo artefacto', 100, 1, 1]); draw(); }], ['↺ Valores de ejemplo', () => { apps = APPS_DEF.map(a => [...a]); draw(); }]]);
  html(ctx.panel, 'La potencia figura en la etiqueta del artefacto. La heladera prende y apaga: usá su potencia media (≈ 40–60 W).', 'muted');
  $('#kwhp', pr).oninput = e => { price = e.target.value; store.set('price', price); summary(); };
  const tbl = html(ctx.stage, '', 'scroll-x');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .9 : .42, () => chart());
  function kwhDay(a) { return a[1] * a[2] * a[3] / 1000; }
  function draw() {
    tbl.innerHTML = `<table class="t"><thead><tr><th>Artefacto</th><th>Potencia (W)</th><th>Horas/día</th><th>Cant.</th><th>kWh/mes</th><th></th></tr></thead><tbody>
      ${apps.map((a, i) => `<tr><td><input data-i="${i}" data-j="0" value="${esc(a[0])}"></td><td><input type="number" data-i="${i}" data-j="1" value="${a[1]}" min="0"></td><td><input type="number" data-i="${i}" data-j="2" value="${a[2]}" min="0" max="24" step="0.05"></td><td><input type="number" data-i="${i}" data-j="3" value="${a[3]}" min="0"></td><td class="n" data-k="${i}">${fmt(kwhDay(a) * 30, 1)}</td><td><button class="btn sm" data-del="${i}" aria-label="Quitar">✕</button></td></tr>`).join('')}
      </tbody></table>`;
    $$('input', tbl).forEach(inp => inp.oninput = () => {
      const i = +inp.dataset.i, j = +inp.dataset.j; apps[i][j] = j ? (+inp.value || 0) : inp.value;
      $(`[data-k="${i}"]`, tbl).textContent = fmt(kwhDay(apps[i]) * 30, 1); summary(); chart();
    });
    $$('[data-del]', tbl).forEach(b => b.onclick = () => { apps.splice(+b.dataset.del, 1); draw(); });
    summary(); chart();
  }
  function summary() {
    store.set('apps', apps);
    const tot = apps.reduce((s, a) => s + kwhDay(a), 0) * 30, p = parseFloat(price);
    ctx.reads([['Consumo diario', fu(tot / 30, 'kWh', 2)], ['Consumo mensual', fu(tot, 'kWh', 0), cssv('--ec')], ['Consumo bimestral', fu(tot * 2, 'kWh', 0)], ['Costo mensual estimado', p > 0 ? '$ ' + fmt(tot * p, 0) : 'cargá el precio', cssv('--ok')]]);
  }
  function chart() {
    const c = cv.ctx; D.clear(cv);
    const list = apps.map(a => [a[0], kwhDay(a) * 30]).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const max = Math.max(...list.map(l => l[1]), 1), rowH = (cv.h - 20) / Math.max(list.length, 1), lw = Math.min(180, cv.w * .4);
    D.text(c, 'kWh por mes de cada artefacto', 0, 8, { size: 12, weight: 700, color: cssv('--muted') });
    list.forEach(([n, v], i) => {
      const y = 20 + i * rowH, bw = v / max * (cv.w - lw - 70);
      D.text(c, n.length > 26 ? n.slice(0, 25) + '…' : n, lw - 6, y + rowH / 2, { align: 'right', size: 11 });
      c.fillStyle = i === 0 ? cssv('--ec') : cssv('--ep'); D.rrect(c, lw, y + 3, Math.max(bw, 2), rowH - 6, 4); c.fill();
      D.text(c, fmt(v, 1), lw + Math.max(bw, 2) + 6, y + rowH / 2, { size: 11, weight: 700 });
    });
  }
  draw();
}
function medMount(ctx) {
  ctx.stage.innerHTML = '';
  heading(ctx.panel, 'Cómo medir');
  html(ctx.panel, '<ol style="margin:0;padding-left:18px"><li>Buscá el medidor de tu casa (en la vereda o en la entrada).</li><li>Anotá el número en kWh y la fecha.</li><li>Repetí unos días después a la misma hora.</li><li>Cargá los datos acá.</li></ol>', 'info');
  const S = controls(ctx.panel, [
    { k: 'a', label: 'Lectura inicial (kWh)', type: 'number', val: 15230 },
    { k: 'b', label: 'Lectura final (kWh)', type: 'number', val: 15286 },
    { k: 'd', label: 'Días entre lecturas', type: 'number', val: 7, min: 1 }
  ], () => calc());
  const box = html(ctx.stage, '');
  function calc() {
    const kwh = S.b - S.a, day = kwh / S.d;
    const ok = isFinite(day) && day >= 0 && S.d > 0;
    box.innerHTML = ok ? `<div class="card"><h3 style="margin-bottom:8px">Tu consumo medido</h3><p>En ${fmt(S.d, 0)} días consumiste <b>${fmt(kwh, 1)} kWh</b>: unos <b>${fmt(day, 2)} kWh por día</b>.</p>
      <p>Eso equivale a mantener prendida una pava eléctrica de 2000 W durante <b>${fmt(day / 2, 1)} horas</b> por día, o una lámpara LED de 9 W durante <b>${fmt(day / .009 / 24, 0)} días</b>.</p>
      <p class="muted">Compará con el cálculo de la pestaña "Mis artefactos". Si hay mucha diferencia, ¿qué artefacto te olvidaste o estimaste mal?</p></div>` : '<div class="alert bad">Revisá los datos: la lectura final tiene que ser mayor que la inicial.</div>';
    ctx.reads(ok ? [['Consumo diario', fu(day, 'kWh', 2), cssv('--ec')], ['Estimado mensual', fu(day * 30, 'kWh', 0)], ['Estimado bimestral', fu(day * 60, 'kWh', 0)]] : []);
  }
  calc();
}
function curvaMount(ctx) {
  heading(ctx.panel, 'Curva de demanda');
  const S = controls(ctx.panel, [{ k: 'v', label: 'Mostrar verano', type: 'check', val: true }, { k: 'i', label: 'Mostrar invierno', type: 'check', val: true }], () => draw());
  html(ctx.panel, 'Forma típica de la demanda eléctrica del país a lo largo de un día (valores ilustrativos en % del pico). Los datos reales los publica CAMMESA.', 'muted');
  const ver = [72, 68, 65, 63, 62, 62, 64, 68, 74, 80, 85, 90, 94, 97, 99, 100, 99, 97, 95, 94, 96, 97, 92, 82, 72];
  const inv = [70, 65, 62, 60, 60, 62, 68, 78, 84, 86, 86, 85, 84, 82, 80, 79, 80, 84, 92, 98, 100, 97, 90, 80, 70];
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .45, () => draw());
  function draw() {
    if (!S) return;
    const c = cv.ctx; D.clear(cv);
    const ser = [];
    if (S.v) ser.push({ pts: ver.map((v, h) => [h, v]), color: cssv('--ec'), label: 'Verano' });
    if (S.i) ser.push({ pts: inv.map((v, h) => [h, v]), color: cssv('--ep'), label: 'Invierno' });
    D.plot(c, { x: 46, y: 26, w: cv.w - 62, h: cv.h - 60 }, ser, { x0: 0, x1: 24, y0: 50, y1: 100, nx: 8, xl: 'hora del día', yl: '% de la demanda máxima', legend: true, xfmt: v => fmt(v, 0) + 'h' });
    ctx.reads([['Pico de verano', 'tarde (≈ 15 h): aire acondicionado', cssv('--ec')], ['Pico de invierno', 'noche (≈ 20 h): luces y calefacción', cssv('--ep')], ['Valle', 'madrugada (≈ 4–5 h)']]);
  }
  draw();
}
