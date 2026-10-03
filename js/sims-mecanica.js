/* ===== Simuladores: hidrostática, Pascal, presión atmosférica, Arquímedes, Bernoulli y capilaridad ===== */
const FLUIDS = { agua: ['Agua dulce', 1000, '#3d8fe0'], mar: ['Agua de mar', 1025, '#2a7bb8'], aceite: ['Aceite', 920, '#d9a520'], alcohol: ['Alcohol', 790, '#9bc8e8'], mercurio: ['Mercurio', 13600, '#9aa3ad'] };
const fluidOpts = Object.entries(FLUIDS).map(([k, v]) => [k, v[0] + ' (ρ = ' + fmt(v[1], 0) + ' kg/m³)']);

/* ---------- 17. Hidrostática ---------- */
defSim({
  id: 'hidrostatica', icon: '🌊', title: 'Presión, hidrostática y Pascal',
  short: 'Presión en un líquido, prensa hidráulica y presión atmosférica',
  desc: 'La presión es la fuerza que actúa por unidad de área. Dentro de un líquido, la presión aumenta con la profundidad y es igual en todas las direcciones. Pascal descubrió que la presión aplicada a un líquido encerrado se transmite a todo el líquido: así funciona la prensa hidráulica.',
  formulas: [['p = F / A', 'presión en pascales (Pa = N/m²)'], ['p = p₀ + ρ · g · h', 'teorema fundamental de la hidrostática'], ['F₂ / A₂ = F₁ / A₁', 'principio de Pascal (prensa hidráulica)'], ['Pe = ρ · g', 'peso específico (N/m³) · 1 atm = 101 325 Pa = 760 mmHg']],
  think: ['¿Por qué las represas son más anchas abajo que arriba?', '¿Por qué te duelen los oídos al bucear a varios metros?', 'Con una prensa hidráulica, ¿se gana energía? ¿Qué se "paga" a cambio de la fuerza?', '¿Por qué el agua hierve a menos de 100 °C en la montaña?'],
  tabs: [
    { id: 'liq', label: '💧 Presión en un líquido', mount: liqMount },
    { id: 'pascal', label: '🚗 Prensa hidráulica', mount: pascalMount },
    { id: 'atm', label: '⛰️ Presión atmosférica', mount: atmMount }
  ]
});
function liqMount(ctx) {
  heading(ctx.panel, 'Recipiente');
  const S = controls(ctx.panel, [
    { k: 'f', label: 'Líquido', type: 'select', val: 'agua', options: fluidOpts },
    { k: 'h', label: 'Profundidad del sensor', min: 0, max: 10, step: .1, val: 4, unit: 'm', d: 1 },
    { k: 'atm', label: 'Sumar la presión atmosférica', type: 'check', val: true }
  ], () => draw());
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .9 : .55, () => draw());
  function draw() {
    if (!S) return;
    const [n, rho, col] = FLUIDS[S.f], ph = rho * G * S.h, p0 = S.atm ? 101325 : 0, p = p0 + ph;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const narrow = W < 600, tw = narrow ? W * .5 : W * .4, x0 = 30, top = 30, bot = H - 30, Y = h => top + h / 10 * (bot - top);
    c.fillStyle = col; c.globalAlpha = .35; c.fillRect(x0, top, tw, bot - top); c.globalAlpha = 1;
    c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.moveTo(x0, top - 10); c.lineTo(x0, bot); c.lineTo(x0 + tw, bot); c.lineTo(x0 + tw, top - 10); c.stroke();
    for (let h = 0; h <= 10; h += 2) D.text(c, h + ' m', x0 - 4, Y(h), { align: 'right', size: 10, color: cssv('--muted') });
    const sx = x0 + tw / 2, sy = Y(S.h), L = Math.min(10 + Math.sqrt(ph / 1000) * 3, 46);
    for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; D.arrow(c, sx + Math.cos(t) * (L + 14), sy + Math.sin(t) * (L + 14), sx + Math.cos(t) * 12, sy + Math.sin(t) * 12, cssv('--ep'), 2, 7); }
    c.fillStyle = cssv('--ink'); c.beginPath(); c.arc(sx, sy, 8, 0, 7); c.fill();
    // gráfico p vs h
    const gx = x0 + tw + 60, gw = W - gx - 16;
    const pmax = 101325 * (S.atm ? 1 : 0) + rho * G * 10;
    D.plot(c, { x: gx, y: top, w: gw, h: bot - top - 10 }, [{ pts: [[0, p0 / 1000], [10, pmax / 1000]], color: col, w: 3 }, { pts: [[S.h, 0], [S.h, p / 1000]], color: cssv('--muted'), dash: [4, 4], w: 1 }], { x0: 0, x1: 10, y0: 0, y1: pmax / 1000 * 1.1, xl: 'profundidad (m)', yl: 'presión (kPa)', nx: 5 });
    ctx.reads([['Presión hidrostática ρgh', fu(ph / 1000, 'kPa', 1), cssv('--ep')], ['Presión total', fu(p / 1000, 'kPa', 1)], ['En atmósferas', fu(p / 101325, 'atm', 2)], ['Peso específico del líquido', fu(rho * G, 'N/m³', 0)]]);
  }
  draw();
}
function pascalMount(ctx) {
  heading(ctx.panel, 'Prensa');
  const S = controls(ctx.panel, [
    { k: 'F1', label: 'Fuerza en el émbolo chico F₁', min: 10, max: 500, step: 5, val: 200, unit: 'N', d: 0 },
    { k: 'd1', label: 'Diámetro émbolo chico', min: 1, max: 10, step: .5, val: 2, unit: 'cm', d: 1 },
    { k: 'd2', label: 'Diámetro émbolo grande', min: 10, max: 60, step: 1, val: 30, unit: 'cm', d: 0 },
    { k: 'x1', label: 'Recorrido del émbolo chico', min: 1, max: 50, step: 1, val: 20, unit: 'cm', d: 0 }
  ], () => draw());
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .45, () => draw());
  function draw() {
    if (!S) return;
    const A1 = Math.PI * (S.d1 / 200) ** 2, A2 = Math.PI * (S.d2 / 200) ** 2, p = S.F1 / A1, F2 = p * A2, x2 = S.x1 * A1 / A2;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const base = H - 30, w1 = clamp(S.d1 * 6, 14, 60), w2 = clamp(S.d2 * 4, 50, W * .45), lx = W * .2, rx = W * .62;
    c.fillStyle = FLUIDS.aceite[2]; c.globalAlpha = .5;
    c.fillRect(lx - w1 / 2, H * .35, w1, base - H * .35); c.fillRect(rx - w2 / 2, H * .45, w2, base - H * .45); c.fillRect(lx - w1 / 2, base - 30, rx - lx, 30); c.globalAlpha = 1;
    c.fillStyle = cssv('--muted'); c.fillRect(lx - w1 / 2, H * .35 - 10, w1, 10); c.fillRect(rx - w2 / 2, H * .45 - 12, w2, 12);
    D.arrow(c, lx, H * .1, lx, H * .35 - 12, cssv('--ec'), 4, 12);
    D.text(c, 'F₁ = ' + fmt(S.F1, 0) + ' N', lx + 12, H * .14, { weight: 700, color: cssv('--ec') });
    D.text(c, '🚗', rx, H * .45 - 34, { align: 'center', size: 40 });
    D.arrow(c, rx + w2 / 2 + 20, H * .45, rx + w2 / 2 + 20, H * .15, cssv('--ok'), 5, 14);
    D.text(c, 'F₂ = ' + fmt(F2, 0) + ' N', rx + w2 / 2 + 30, H * .3, { weight: 700, color: cssv('--ok') });
    ctx.reads([['Presión transmitida', fu(p / 1000, 'kPa', 1), cssv('--ep')], ['Fuerza en el émbolo grande', fu(F2, 'N', 0), cssv('--ok')], ['Masa que puede levantar', fu(F2 / G, 'kg', 0), cssv('--ok')], ['Multiplicación de la fuerza', '× ' + fmt(A2 / A1, 1)], ['Sube el émbolo grande', fu(x2 * 10, 'mm', 2)]]);
  }
  draw();
}
function atmMount(ctx) {
  heading(ctx.panel, 'Altura sobre el nivel del mar');
  const S = controls(ctx.panel, [{ k: 'h', label: 'Altitud', min: 0, max: 9000, step: 10, val: 440, unit: 'm', d: 0 }], () => draw());
  buttons(ctx.panel, [['Nivel del mar', () => S.set({ h: 0 })], ['Río Cuarto', () => S.set({ h: 440 })], ['La Quiaca', () => S.set({ h: 3440 })], ['Aconcagua', () => S.set({ h: 6961 })], ['Everest', () => S.set({ h: 8849 })]]);
  html(ctx.panel, 'Torricelli midió la presión atmosférica con un tubo lleno de mercurio: al nivel del mar la columna mide 760 mm.', 'info');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .5, () => draw());
  function draw() {
    if (!S) return;
    const p = 101.325 * Math.exp(-S.h / 8400), mm = p / 101.325 * 760, Tb = 100 - S.h / 300;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const mw = W * .62, base = H - 20, Y = h => base - h / 9000 * (H - 50);
    c.fillStyle = cssv('--soft'); c.beginPath(); c.moveTo(0, base); c.lineTo(mw * .2, Y(2000)); c.lineTo(mw * .38, Y(4500)); c.lineTo(mw * .55, Y(8849)); c.lineTo(mw * .75, Y(5000)); c.lineTo(mw, base); c.fill();
    c.fillStyle = cssv('--ec'); c.beginPath(); c.arc(mw * .55 * Math.min(S.h / 8849, 1) + 10, Y(S.h), 7, 0, 7); c.fill();
    D.text(c, fmt(S.h, 0) + ' m', mw * .55 * Math.min(S.h / 8849, 1) + 22, Y(S.h), { weight: 700 });
    // barómetro de Torricelli
    const bx = W * .82, bt = 30, bb = H - 40, ty = mmv => bb - mmv / 800 * (bb - bt);
    c.strokeStyle = cssv('--ink'); c.lineWidth = 2; c.strokeRect(bx - 8, bt, 16, bb - bt);
    c.fillStyle = FLUIDS.mercurio[2]; c.fillRect(bx - 7, ty(mm), 14, bb - ty(mm));
    c.fillRect(bx - 34, bb - 4, 68, 16);
    D.text(c, fmt(mm, 0) + ' mmHg', bx + 14, ty(mm), { weight: 700 });
    D.text(c, '760', bx - 14, ty(760), { align: 'right', size: 10, color: cssv('--muted') });
    ctx.reads([['Presión atmosférica', fu(p, 'kPa', 1), cssv('--ep')], ['En hectopascales', fu(p * 10, 'hPa', 0)], ['Columna de mercurio', fu(mm, 'mm', 0)], ['El agua hierve a (aprox.)', fu(Tb, '°C', 0), cssv('--hot')]]);
  }
  draw();
}

/* ---------- 18. Principio de Arquímedes ---------- */
const SOLIDS = { corcho: ['Corcho', 240], madera: ['Madera de pino', 550], hielo: ['Hielo', 917], plastico: ['Plástico (polietileno)', 950], ladrillo: ['Ladrillo', 1900], aluminio: ['Aluminio', 2700], hierro: ['Hierro', 7870], oro: ['Oro', 19300] };
defSim({
  id: 'arquimedes', icon: '⚓', title: 'Flotación y principio de Arquímedes',
  short: '¿Flota o se hunde? Empuje, peso y peso aparente',
  desc: 'Todo cuerpo sumergido en un fluido recibe una fuerza hacia arriba, el empuje, igual al peso del fluido que desaloja. Si el cuerpo es menos denso que el fluido, flota con una parte sumergida; si es más denso, se hunde, pero "pesa menos" dentro del líquido.',
  formulas: [['E = ρ fluido · g · V sumergido', 'empuje (N)'], ['P = ρ cuerpo · g · V', 'peso del cuerpo'], ['Flota si ρ cuerpo < ρ fluido', 'fracción sumergida = ρ cuerpo / ρ fluido'], ['P aparente = P − E', 'lo que marca el dinamómetro dentro del líquido']],
  think: ['¿Por qué un barco de acero flota y un clavo de acero se hunde?', '¿Qué parte de un iceberg queda bajo el agua?', '¿Por qué es más fácil flotar en el mar que en una pileta?', '¿Una pelota de hierro flotaría en mercurio? Probalo.'],
  mount(ctx) {
    heading(ctx.panel, 'Cuerpo y fluido');
    const S = controls(ctx.panel, [
      { k: 'o', label: 'Material del cuerpo', type: 'select', val: 'madera', options: Object.entries(SOLIDS).map(([k, v]) => [k, v[0] + ' (' + fmt(v[1], 0) + ' kg/m³)']) },
      { k: 'V', label: 'Volumen del cuerpo', min: .1, max: 10, step: .1, val: 2, unit: 'L', d: 1 },
      { k: 'f', label: 'Fluido', type: 'select', val: 'agua', options: fluidOpts }
    ], () => draw());
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .85 : .55, () => draw());
    function draw() {
      if (!S) return;
      const ro = SOLIDS[S.o][1], [fn, rf, col] = FLUIDS[S.f], V = S.V / 1000;
      const P = ro * G * V, floats = ro < rf, frac = floats ? ro / rf : 1, E = rf * G * V * frac, Pap = P - E;
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const tx = W * .15, tw = W * .55, wl = H * .42, bot = H - 20;
      c.fillStyle = col; c.globalAlpha = .35; c.fillRect(tx, wl, tw, bot - wl); c.globalAlpha = 1;
      c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.moveTo(tx, H * .2); c.lineTo(tx, bot); c.lineTo(tx + tw, bot); c.lineTo(tx + tw, H * .2); c.stroke();
      const s = clamp(40 + Math.cbrt(S.V) * 28, 40, (bot - wl) * .7), cx = tx + tw / 2;
      let y;
      if (floats) y = wl - s + s * frac;
      else { y = wl + (bot - wl) * .35 - s / 2;
        // dinamómetro
        c.strokeStyle = cssv('--muted'); c.lineWidth = 2; c.beginPath(); c.moveTo(cx, 10); c.lineTo(cx, 34); c.stroke();
        c.strokeRect(cx - 12, 34, 24, 50); D.text(c, fmt(Pap, 1) + ' N', cx + 18, 60, { weight: 700, color: cssv('--accent') });
        c.beginPath(); c.moveTo(cx, 84); c.lineTo(cx, y); c.stroke();
      }
      c.fillStyle = '#b07a43'; if (['aluminio', 'hierro'].includes(S.o)) c.fillStyle = '#8b95a5'; if (S.o === 'oro') c.fillStyle = '#e5b931'; if (S.o === 'hielo') c.fillStyle = '#cfe9ff'; if (S.o === 'corcho') c.fillStyle = '#c99a5b'; if (S.o === 'plastico') c.fillStyle = '#f0f0f0'; if (S.o === 'ladrillo') c.fillStyle = '#b5523a';
      c.fillRect(cx - s / 2, y, s, s); c.strokeStyle = cssv('--ink'); c.lineWidth = 1.5; c.strokeRect(cx - s / 2, y, s, s);
      const sc = 60 / Math.max(P, E, 1);
      D.arrow(c, cx - 14, y + s / 2, cx - 14, y + s / 2 + P * sc + 10, cssv('--ec'), 4, 12);
      D.text(c, 'Peso ' + fmt(P, 1) + ' N', cx - 22, y + s / 2 + P * sc + 18, { align: 'right', weight: 700, color: cssv('--ec') });
      D.arrow(c, cx + 14, y + s / 2, cx + 14, y + s / 2 - E * sc - 10, cssv('--ep'), 4, 12);
      D.text(c, 'Empuje ' + fmt(E, 1) + ' N', cx + 22, y + s / 2 - E * sc - 18, { weight: 700, color: cssv('--ep') });
      ctx.reads([['Resultado', floats ? 'Flota' : 'Se hunde', floats ? cssv('--ok') : cssv('--bad')], ['Peso', fu(P, 'N', 2), cssv('--ec')], ['Empuje', fu(E, 'N', 2), cssv('--ep')], [floats ? 'Parte sumergida' : 'Peso aparente', floats ? fmt(frac * 100, 0) + ' %' : fu(Pap, 'N', 2)]]);
    }
    draw();
  }
});

/* ---------- 19. Fluidos en movimiento ---------- */
defSim({
  id: 'bernoulli', icon: '🚰', title: 'Fluidos en movimiento: continuidad y Bernoulli',
  short: 'Caudal, velocidad y presión en un caño con un angostamiento · capilaridad',
  desc: 'En un caño, el caudal es el mismo en todas las secciones: donde el caño se angosta, el agua va más rápido. Bernoulli mostró que donde la velocidad aumenta, la presión disminuye. Además, en tubos muy finos, la tensión superficial hace subir el agua (capilaridad).',
  formulas: [['Q = A · v', 'caudal (m³/s)'], ['A₁ · v₁ = A₂ · v₂', 'ecuación de continuidad'], ['p + ½ρv² + ρgh = constante', 'teorema de Bernoulli'], ['h = 2γ · cos θ / (ρ · g · r)', 'altura capilar (γ: tensión superficial)']],
  think: ['¿Por qué al tapar parcialmente la manguera el agua sale más rápido?', '¿Cómo se relaciona Bernoulli con el vuelo de un avión o con una cortina de baño que se mete hacia adentro?', '¿Por qué una toalla de papel absorbe el agua?', '¿Qué es la viscosidad? Compará la miel con el agua.'],
  tabs: [
    { id: 'ber', label: '🚰 Continuidad y Bernoulli', mount: berMount },
    { id: 'cap', label: '🧪 Capilaridad', mount: capMount }
  ]
});
function berMount(ctx) {
  heading(ctx.panel, 'Caño');
  const S = controls(ctx.panel, [
    { k: 'Q', label: 'Caudal', min: .5, max: 10, step: .1, val: 3, unit: 'L/s', d: 1 },
    { k: 'd1', label: 'Diámetro sección 1', min: 3, max: 10, step: .5, val: 8, unit: 'cm', d: 1 },
    { k: 'd2', label: 'Diámetro sección 2', min: 1, max: 10, step: .5, val: 4, unit: 'cm', d: 1 },
    { k: 'p1', label: 'Presión manométrica en 1', min: 10, max: 200, step: 5, val: 60, unit: 'kPa', d: 0 }
  ]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .45, () => { });
  let parts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 2 - 1 }));
  animate(cv, dt => {
    const A1 = Math.PI * (S.d1 / 200) ** 2, A2 = Math.PI * (S.d2 / 200) ** 2, Qm = S.Q / 1000, v1 = Qm / A1, v2 = Qm / A2;
    const p2 = S.p1 * 1000 - .5 * 1000 * (v2 * v2 - v1 * v1);
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const cy = H * .68, maxR = H * .22, r1 = S.d1 / 10 * maxR, r2 = S.d2 / 10 * maxR;
    const rad = u => u < .35 ? r1 : u > .65 ? r2 : lerp(r1, r2, (1 - Math.cos((u - .35) / .3 * Math.PI)) / 2);
    const X = u => 20 + u * (W - 40);
    c.fillStyle = FLUIDS.agua[2]; c.globalAlpha = .3; c.beginPath();
    for (let i = 0; i <= 100; i++) { const u = i / 100; c.lineTo(X(u), cy - rad(u)); } for (let i = 100; i >= 0; i--) { const u = i / 100; c.lineTo(X(u), cy + rad(u)); } c.fill(); c.globalAlpha = 1;
    c.strokeStyle = cssv('--ink'); c.lineWidth = 3;
    [-1, 1].forEach(s => { c.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100; c.lineTo(X(u), cy + s * rad(u)); } c.stroke(); });
    c.fillStyle = cssv('--water');
    parts.forEach(p => { const r = rad(p.x), vloc = Qm / (Math.PI * (r / maxR * .1 / 2) ** 2); p.x += dt * vloc * .08; if (p.x > 1) { p.x = 0; p.y = Math.random() * 2 - 1; } c.beginPath(); c.arc(X(p.x), cy + p.y * rad(p.x) * .85, 2.5, 0, 7); c.fill(); });
    // tubos piezométricos
    const top = 14, hmax = cy - maxR - top - 10, hp = pp => clamp(pp / 200000, 0, 1) * hmax;
    [[.17, S.p1 * 1000, r1, '1'], [.83, p2, r2, '2']].forEach(([u, pp, r, l]) => {
      const x = X(u); c.strokeStyle = cssv('--ink'); c.lineWidth = 2; c.strokeRect(x - 7, cy - r - hmax - 4, 14, hmax + 4);
      c.fillStyle = FLUIDS.agua[2]; c.fillRect(x - 6, cy - r - hp(pp), 12, hp(pp));
      D.text(c, l, x, cy, { align: 'center', weight: 700, size: 15 });
      D.text(c, fmt(pp / 1000, 1) + ' kPa', x + 14, cy - r - hp(pp), { weight: 700, size: 12 });
    });
    ctx.reads([['Velocidad en 1', fu(v1, 'm/s', 2), cssv('--ep')], ['Velocidad en 2', fu(v2, 'm/s', 2), cssv('--ec')], ['Presión en 2', p2 > 0 ? fu(p2 / 1000, 'kPa', 1) : '¡negativa! (cavitación)', p2 > 0 ? cssv('--water') : cssv('--bad')], ['Diferencia de presión p₁ − p₂', fu((S.p1 * 1000 - p2) / 1000, 'kPa', 2)]]);
  });
}
function capMount(ctx) {
  heading(ctx.panel, 'Tubo capilar');
  const S = controls(ctx.panel, [
    { k: 'r', label: 'Radio del tubo', min: .1, max: 2, step: .05, val: .5, unit: 'mm', d: 2 },
    { k: 'l', label: 'Líquido', type: 'select', val: 'agua', options: [['agua', 'Agua (moja el vidrio)'], ['mercurio', 'Mercurio (no moja el vidrio)']] }
  ], () => draw());
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .5, () => draw());
  function draw() {
    if (!S) return;
    const L = S.l === 'agua' ? { g: .0728, th: 0, rho: 1000, col: FLUIDS.agua[2] } : { g: .485, th: 140, rho: 13600, col: FLUIDS.mercurio[2] };
    const hOf = r => 2 * L.g * Math.cos(L.th * RAD) / (L.rho * G * r / 1000);
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const lvl = H * .62, sc = (lvl - 20) / 0.06; // 6 cm máx
    c.fillStyle = L.col; c.globalAlpha = .35; c.fillRect(20, lvl, W - 40, H - lvl - 10); c.globalAlpha = 1;
    const radii = [2, 1, .5, .25, S.r];
    radii.forEach((r, i) => {
      const x = 60 + i * (W - 120) / 4, w = clamp(r * 14, 4, 30), h = clamp(hOf(r), -.03, .06);
      c.fillStyle = L.col; c.fillRect(x - w / 2, lvl - h * sc, w, h * sc + 40);
      c.strokeStyle = i === 4 ? cssv('--accent') : cssv('--ink'); c.lineWidth = i === 4 ? 3 : 1.5; c.strokeRect(x - w / 2, 16, w, H - 40);
      D.text(c, (i === 4 ? 'elegido ' : '') + fmt(r, 2) + ' mm', x, H - 12, { align: 'center', size: 11, weight: i === 4 ? 700 : 500 });
      D.text(c, fmt(hOf(r) * 1000, 1) + ' mm', x + w / 2 + 4, lvl - h * sc, { size: 11, weight: 700 });
    });
    ctx.reads([['Altura capilar', fu(hOf(S.r) * 1000, 'mm', 1), cssv('--water')], ['Tensión superficial', fu(L.g, 'N/m', 4)], ['El líquido', hOf(S.r) > 0 ? 'sube por el tubo' : 'baja en el tubo']]);
  }
  draw();
}
