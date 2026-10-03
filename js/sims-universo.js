/* ===== Simuladores: fuerzas fundamentales, ámbitos de las teorías y relatividad ===== */

/* ---------- 20. Fuerzas fundamentales y ámbitos de aplicación ---------- */
const FORCES = [
  ['Nuclear fuerte', 0, '≈ 10⁻¹⁵ m (tamaño de un núcleo)', 'gluones', 'Mantiene unidos a los quarks dentro de protones y neutrones, y a estos dentro del núcleo.', '#e0483e'],
  ['Electromagnética', -2.1, 'infinito', 'fotones', 'Explica la electricidad, el magnetismo, la luz, la química, el rozamiento y por qué no atravesamos las paredes.', '#2f6fe4'],
  ['Nuclear débil', -6, '≈ 10⁻¹⁸ m', 'bosones W y Z', 'Provoca la desintegración beta y participa en la fusión nuclear que hace brillar al Sol.', '#9b59d0'],
  ['Gravitatoria', -38, 'infinito', 'gravitón (hipotético)', 'Es la más débil, pero siempre atrae y se acumula: domina planetas, estrellas, mareas y galaxias.', '#2bb673']
];
const SCALES = [
  ['⚽ Pelota de fútbol', .22, 30, 'Clásica: Newton funciona perfecto. Tamaño cotidiano y velocidad muy chica comparada con la luz.'],
  ['🚗 Auto en la ruta', 4, 30, 'Clásica: las leyes de Newton alcanzan.'],
  ['🛰️ Satélite GPS', 2.5, 3900, 'Clásica para la órbita, ¡pero sus relojes necesitan correcciones de la relatividad! Sin ellas el GPS se equivocaría varios kilómetros por día.'],
  ['🌍 Tierra alrededor del Sol', 1.27e7, 29800, 'Clásica: Newton y Kepler describen muy bien la órbita. Einstein explica pequeñas diferencias (como la órbita de Mercurio).'],
  ['⚛️ Electrón en un átomo', 1e-10, 2.2e6, 'Cuántica: a esta escala la materia se comporta como onda y la energía está cuantizada.'],
  ['💥 Protón en el LHC', 1e-15, 2.99792e8 * .99999999, 'Cuántica y relativista a la vez: se necesita la física de partículas (teoría cuántica de campos).'],
  ['🌌 Galaxia', 1e21, 6e5, 'Gravitación a gran escala: se usa la relatividad general para el universo en su conjunto.'],
  ['☀️ Núcleo del Sol', 1e-15, 1e6, 'Cuántica: la fusión ocurre gracias al efecto túnel, un fenómeno cuántico.']
];
defSim({
  id: 'fuerzas', icon: '🔭', title: 'Fuerzas fundamentales y teorías físicas',
  short: 'Las 4 interacciones y cuándo usar Newton, Einstein o la cuántica',
  desc: 'Toda la naturaleza se explica con cuatro interacciones fundamentales. Y para describir el movimiento usamos distintas teorías según la escala: Newton para lo cotidiano, la relatividad de Einstein para velocidades cercanas a la de la luz y la física cuántica para lo muy pequeño.',
  formulas: [['F gravitatoria = G · m₁ · m₂ / r²', 'G = 6,67 × 10⁻¹¹ N·m²/kg²'], ['F eléctrica = k · q₁ · q₂ / r²', 'k = 8,99 × 10⁹ N·m²/C²'], ['Entre dos protones: F eléctrica / F gravitatoria ≈ 10³⁶', '¡la gravedad es muchísimo más débil!']],
  think: ['Si la gravedad es la fuerza más débil, ¿por qué es la que domina el movimiento de los planetas?', '¿Qué fuerza actúa cuando apoyás la mano en la mesa?', '¿Por qué el GPS necesita la teoría de la relatividad?', '¿Las teorías de Newton están "equivocadas"? ¿Cuándo se pueden usar?'],
  tabs: [
    { id: 'f4', label: '⚛️ Las 4 fuerzas', mount: f4Mount },
    { id: 'map', label: '🗺️ ¿Newton, Einstein o cuántica?', mount: mapMount }
  ]
});
function f4Mount(ctx) {
  ctx.panel.remove();
  html(ctx.stage, `<div class="force-cards">${FORCES.map(f => `<div class="card" style="border-top:4px solid ${f[5]}"><h3 style="font-size:1.1rem;margin-bottom:6px">${f[0]}</h3><p style="margin:0 0 6px"><b>Intensidad relativa:</b> 10<sup>${f[1] === 0 ? '0' : Math.round(f[1])}</sup><br><b>Alcance:</b> ${f[2]}<br><b>Partícula mediadora:</b> ${f[3]}</p><p class="muted" style="margin:0;font-size:.92rem">${f[4]}</p></div>`).join('')}</div>`);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .6 : .3, () => draw());
  function draw() {
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    D.text(c, 'Intensidad relativa (escala logarítmica: cada marca es 10 veces menos)', 10, 12, { size: 12, weight: 700, color: cssv('--muted') });
    const lw = 130, bw = W - lw - 60, rowH = (H - 30) / 4;
    FORCES.forEach((f, i) => {
      const y = 26 + i * rowH, w = (40 + f[1]) / 40 * bw;
      D.text(c, f[0], lw - 8, y + rowH / 2, { align: 'right', size: 12, weight: 600 });
      c.fillStyle = f[5]; D.rrect(c, lw, y + 4, Math.max(w, 3), rowH - 8, 5); c.fill();
      D.text(c, '10' + (f[1] === 0 ? '⁰' : String(Math.round(f[1])).split('').map(ch => SUP[ch]).join('')), lw + Math.max(w, 3) + 6, y + rowH / 2, { size: 12, weight: 700 });
    });
  }
  draw();
}
function mapMount(ctx) {
  heading(ctx.panel, 'Ejemplos');
  let sel = 0;
  const info = html(ctx.panel, '', 'info');
  const bl = buttons(ctx.panel, SCALES.map((s, i) => [s[0], () => { sel = i; draw(); }]));
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .9 : .55, () => draw());
  const C = 2.998e8, xr = [-16, 26], yr = [-10, 0];
  const r = () => ({ x: 56, y: 20, w: cv.w - 70, h: cv.h - 60 });
  const X = (lg) => r().x + (lg - xr[0]) / (xr[1] - xr[0]) * r().w, Y = lg => r().y + r().h - (lg - yr[0]) / (yr[1] - yr[0]) * r().h;
  pointer(cv, p => { let best = -1, bd = 30; SCALES.forEach((s, i) => { const d = Math.hypot(X(Math.log10(s[1])) - p.x, Y(Math.log10(s[2] / C)) - p.y); if (d < bd) { bd = d; best = i; } }); if (best >= 0) { sel = best; draw(); } });
  function draw() {
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const R = r();
    const reg = (x0, x1, y0, y1, col, label) => { c.fillStyle = col; c.globalAlpha = .16; c.fillRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1)); c.globalAlpha = 1; D.text(c, label, (X(x0) + X(x1)) / 2, (Y(y0) + Y(y1)) / 2, { align: 'center', size: 13, weight: 700, color: col }); };
    reg(-8, 26, -10, -1, '#2bb673', 'Física clásica (Newton)');
    reg(-8, 26, -1, 0, '#2f6fe4', 'Relatividad (Einstein)');
    reg(-16, -8, -10, -1, '#9b59d0', 'Física cuántica');
    reg(-16, -8, -1, 0, '#e0483e', 'Cuántica relativista');
    c.strokeStyle = cssv('--muted'); c.lineWidth = 1; c.strokeRect(R.x, R.y, R.w, R.h);
    for (let e = -16; e <= 26; e += 6) D.text(c, '10' + String(e).split('').map(ch => SUP[ch]).join(''), X(e), R.y + R.h + 14, { align: 'center', size: 10, color: cssv('--muted') });
    for (let e = -10; e <= 0; e += 2) D.text(c, e === 0 ? 'c' : '10' + String(e).split('').map(ch => SUP[ch]).join('') + ' c', R.x - 6, Y(e), { align: 'right', size: 10, color: cssv('--muted') });
    D.text(c, 'tamaño (m)', R.x + R.w, R.y + R.h + 30, { align: 'right', size: 11, weight: 600, color: cssv('--muted') });
    D.text(c, 'velocidad', R.x, 10, { size: 11, weight: 600, color: cssv('--muted') });
    SCALES.forEach((s, i) => {
      const x = X(Math.log10(s[1])), y = Y(Math.log10(s[2] / C));
      c.fillStyle = i === sel ? cssv('--ec') : cssv('--ink'); c.beginPath(); c.arc(x, y, i === sel ? 8 : 5, 0, 7); c.fill();
      if (i === sel) D.text(c, s[0], x + 12, y - 12, { weight: 700 });
    });
    const s = SCALES[sel];
    info.innerHTML = `<b>${s[0]}</b><br>${s[3]}`;
    ctx.reads([['Tamaño', fu(s[1], 'm', 2)], ['Velocidad', fu(s[2], 'm/s', 0)], ['Fracción de la velocidad de la luz', fmt(s[2] / C, 8)]]);
  }
  draw();
}

/* ---------- 21. Relatividad especial ---------- */
defSim({
  id: 'relatividad', icon: '🚀', title: 'Relatividad especial',
  short: 'Dilatación del tiempo y contracción de la longitud',
  desc: 'Postulados de Einstein (1905): 1) las leyes de la física son las mismas para todos los observadores que se mueven a velocidad constante; 2) la velocidad de la luz en el vacío es la misma para todos (c ≈ 300 000 km/s). Consecuencia: para una nave muy rápida el tiempo pasa más lento y su longitud se acorta, vista desde la Tierra.',
  formulas: [['γ = 1 / √(1 − v²/c²)', 'factor de Lorentz'], ['Δt nave = Δt Tierra / γ', 'dilatación del tiempo'], ['L = L₀ / γ', 'contracción de la longitud'], ['E = m · c²', 'equivalencia entre masa y energía']],
  think: ['¿A partir de qué velocidad los efectos empiezan a notarse? Probá con 10 %, 50 % y 90 % de c.', '¿Puede una nave alcanzar la velocidad de la luz? ¿Qué pasa con γ?', 'Paradoja de los gemelos: uno viaja y otro se queda. ¿Quién envejece menos?', '¿Por qué estos efectos no se notan en la vida cotidiana?'],
  mount(ctx) {
    heading(ctx.panel, 'Viaje a Próxima Centauri');
    const S = controls(ctx.panel, [{ k: 'b', label: 'Velocidad de la nave', min: 0, max: .999, step: .001, val: .8, fmt: v => fmt(v * 100, 1) + ' % de c' }], () => { tE = 0; });
    buttons(ctx.panel, [['10 % c', () => S.set({ b: .1 })], ['50 % c', () => S.set({ b: .5 })], ['90 % c', () => S.set({ b: .9 })], ['99,9 % c', () => S.set({ b: .999 })]]);
    html(ctx.panel, 'Próxima Centauri es la estrella más cercana al Sol: está a 4,24 años luz.', 'muted');
    let tE = 0;
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .9 : .5, () => { });
    animate(cv, dt => {
      const b = Math.max(S.b, 1e-6), g = 1 / Math.sqrt(1 - b * b), d = 4.24, TE = d / b, TS = TE / g;
      tE = (tE + dt * TE / 8) % (TE * 1.15);
      const tEarth = Math.min(tE, TE), tShip = tEarth / g;
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      // nave
      const L0 = Math.min(W * .4, 220), L = L0 / g, y = H * .22, x = 20 + (W - 40 - L0) * (tEarth / TE);
      c.fillStyle = cssv('--accent'); c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + L - 18, y - 14); c.lineTo(x + L, y); c.lineTo(x + L - 18, y + 14); c.lineTo(x, y + 14); c.closePath(); c.fill();
      D.text(c, 'nave: ' + fmt(100 / g, 1) + ' m (en reposo mide 100 m)', 20, y + 34, { size: 12, weight: 600 });
      c.fillStyle = cssv('--sun'); c.beginPath(); c.arc(W - 16, y, 8, 0, 7); c.fill();
      // relojes
      const clock = (cx, cy, yrs, label, col) => {
        const R = Math.min(W * .16, 70);
        c.strokeStyle = cssv('--edge'); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        const a = (yrs % 1) * Math.PI * 2 - Math.PI / 2;
        c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * .8, cy + Math.sin(a) * R * .8); c.stroke();
        D.text(c, label, cx, cy - R - 14, { align: 'center', weight: 700 });
        D.text(c, fmt(yrs, 2) + ' años', cx, cy + R + 18, { align: 'center', weight: 700, size: 15, color: col });
      };
      clock(W * .3, H * .66, tEarth, '🌍 Reloj en la Tierra', cssv('--ok'));
      clock(W * .7, H * .66, tShip, '🚀 Reloj en la nave', cssv('--accent'));
      ctx.reads([['Factor de Lorentz γ', fmt(g, 3), cssv('--accent')], ['Duración del viaje (Tierra)', fu(TE, 'años', 2), cssv('--ok')], ['Duración del viaje (nave)', fu(TS, 'años', 2), cssv('--accent')], ['Diferencia de edad al llegar', fu(TE - TS, 'años', 2)]]);
    });
  }
});
