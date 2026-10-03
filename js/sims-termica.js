/* ===== Simuladores: calorimetría, cambios de estado, primera ley y máquinas térmicas, escalas y dilatación ===== */

const MATS = { agua: ['Agua', 4186], aceite: ['Aceite', 2000], aluminio: ['Aluminio', 900], vidrio: ['Vidrio', 840], hierro: ['Hierro', 450], cobre: ['Cobre', 385], plomo: ['Plomo', 128] };

/* ---------- 10. Equilibrio térmico ---------- */
defSim({
  id: 'calorimetria', icon: '🫗', title: 'Equilibrio térmico y calor específico',
  short: 'Dos cuerpos en contacto intercambian calor hasta igualar temperaturas',
  desc: 'Cuando dos cuerpos a distinta temperatura se ponen en contacto, el calor pasa del más caliente al más frío hasta que alcanzan la misma temperatura: el equilibrio térmico. El que tiene más masa y mayor calor específico cambia menos su temperatura.',
  formulas: [['Q = m · c · ΔT', 'calor sensible (c: calor específico, J/kg·°C)'], ['Q cedido + Q absorbido = 0', 'si no hay pérdidas al ambiente'], ['Te = (m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂)', 'temperatura de equilibrio']],
  think: ['¿Por qué el agua tarda tanto en calentarse comparada con un metal?', 'Si mezclás 1 kg de agua a 80 °C con 1 kg a 20 °C, ¿qué temperatura final esperás? Comprobalo.', '¿Por qué las ciudades costeras tienen temperaturas más moderadas?', '¿Por qué el agua sirve para almacenar energía térmica?'],
  mount(ctx) {
    heading(ctx.panel, 'Cuerpo A (caliente)');
    let t = 0, hist = [];
    const opts = Object.entries(MATS).map(([k, v]) => [k, v[0] + ' (c = ' + fmt(v[1], 0) + ')']);
    const reset = () => { t = 0; hist = []; };
    const S = controls(ctx.panel, [
      { k: 'ma', label: 'Material A', type: 'select', val: 'hierro', options: opts },
      { k: 'mA', label: 'Masa A', min: .1, max: 5, step: .1, val: 1, unit: 'kg', d: 1 },
      { k: 'TA', label: 'Temperatura A', min: 0, max: 300, step: 1, val: 200, unit: '°C', d: 0 },
      { k: 'mb', label: 'Material B', type: 'select', val: 'agua', options: opts },
      { k: 'mB', label: 'Masa B', min: .1, max: 5, step: .1, val: 1, unit: 'kg', d: 1 },
      { k: 'TB', label: 'Temperatura B', min: 0, max: 100, step: 1, val: 20, unit: '°C', d: 0 }
    ], reset);
    buttons(ctx.panel, [['↺ Volver a empezar', reset, 'primary'], ['Agua + agua', () => S.set({ ma: 'agua', mb: 'agua', mA: 1, mB: 1, TA: 80, TB: 20 })]]);
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .55 : .38, () => { });
    const gr = makeCanvas(ctx.stage, w => w < 600 ? .55 : .3, () => { });
    animate(cv, dt => {
      const cA = MATS[S.ma][1], cB = MATS[S.mb][1], CA = S.mA * cA, CB = S.mB * cB;
      const Te = (CA * S.TA + CB * S.TB) / (CA + CB), tau = 2.2;
      t = Math.min(t + dt, 14);
      const k = Math.exp(-t / tau), TA = Te + (S.TA - Te) * k, TB = Te + (S.TB - Te) * k;
      if (!hist.length || t - hist[hist.length - 1][0] > .05) hist.push([t, TA, TB]);
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const sA = 50 + 40 * Math.cbrt(S.mA), sB = 50 + 40 * Math.cbrt(S.mB), cy = H / 2 + 6;
      const xA = W / 2 - sA, xB = W / 2;
      c.fillStyle = tempColor(TA, 0, 200); D.rrect(c, xA, cy - sA / 2, sA, sA, 10); c.fill();
      c.fillStyle = tempColor(TB, 0, 200); D.rrect(c, xB, cy - sB / 2, sB, sB, 10); c.fill();
      D.text(c, MATS[S.ma][0], xA + sA / 2, cy - 10, { align: 'center', weight: 700, color: '#fff' });
      D.text(c, fmt(TA, 1) + ' °C', xA + sA / 2, cy + 12, { align: 'center', weight: 700, color: '#fff', size: 15 });
      D.text(c, MATS[S.mb][0], xB + sB / 2, cy - 10, { align: 'center', weight: 700, color: '#fff' });
      D.text(c, fmt(TB, 1) + ' °C', xB + sB / 2, cy + 12, { align: 'center', weight: 700, color: '#fff', size: 15 });
      const dT = TA - TB;
      if (Math.abs(dT) > .3) {
        const w = clamp(Math.abs(dT) / 15, 2, 14); const dir = dT > 0 ? 1 : -1;
        D.arrow(c, W / 2 - 40 * dir, cy - Math.max(sA, sB) / 2 - 18, W / 2 + 40 * dir, cy - Math.max(sA, sB) / 2 - 18, cssv('--hot'), w);
        D.text(c, 'calor', W / 2, cy - Math.max(sA, sB) / 2 - 36, { align: 'center', weight: 700, color: cssv('--hot') });
      } else D.text(c, '¡Equilibrio térmico!', W / 2, 18, { align: 'center', weight: 700, color: cssv('--ok'), size: 15 });
      const g = gr.ctx; D.clear(gr);
      const lo = Math.min(S.TA, S.TB) - 5, hi = Math.max(S.TA, S.TB) + 5;
      D.plot(g, { x: 46, y: 22, w: gr.w - 60, h: gr.h - 50 }, [{ pts: hist.map(h => [h[0], h[1]]), color: cssv('--hot'), label: 'A' }, { pts: hist.map(h => [h[0], h[2]]), color: cssv('--cold'), label: 'B' }, { pts: [[0, Te], [14, Te]], color: cssv('--ok'), dash: [5, 5], w: 1.5, label: 'Te' }], { x0: 0, x1: 14, y0: lo, y1: hi, xl: 'tiempo', yl: 'Temperatura (°C)', legend: true, xfmt: () => '' });
      ctx.reads([['Temperatura de equilibrio', fu(Te, '°C', 1), cssv('--ok')], ['Calor transferido', fu(Math.abs(CA * (S.TA - Te)), 'J', 0), cssv('--hot')], ['Capacidad calorífica A (m·c)', fu(CA, 'J/°C', 0)], ['Capacidad calorífica B (m·c)', fu(CB, 'J/°C', 0)]]);
    });
  }
});

/* ---------- 11. Cambios de estado: calor sensible y latente ---------- */
defSim({
  id: 'cambio', icon: '🧊', title: 'Cambios de estado: calor sensible y latente',
  short: 'Curva de calentamiento del agua: de hielo a vapor',
  desc: 'Calentamos hielo con una hornalla de potencia constante. Mientras cambia la temperatura se absorbe calor sensible; durante la fusión y la ebullición la temperatura queda constante aunque se sigue entregando energía: es el calor latente.',
  formulas: [['Q = m · c · ΔT', 'calor sensible'], ['Q = m · L', 'calor latente (sin cambio de temperatura)'], ['L fusión = 334 000 J/kg · L vaporización = 2 260 000 J/kg', 'agua'], ['c hielo = 2100 · c agua = 4186 · c vapor = 2010 J/kg·°C', ''], ['t = Q / P', 'tiempo con potencia constante']],
  think: ['¿Por qué la temperatura no sube mientras el hielo se derrite?', '¿Qué etapa necesita más energía? ¿Por qué?', '¿Por qué una quemadura con vapor es más grave que con agua a 100 °C?', '¿Cómo se usa el calor latente para almacenar energía (por ejemplo, con sales que se funden)?'],
  mount(ctx) {
    heading(ctx.panel, 'Experimento');
    let Qn = 0, run = true;
    const S = controls(ctx.panel, [
      { k: 'm', label: 'Masa de hielo', min: .1, max: 2, step: .1, val: 1, unit: 'kg', d: 1 },
      { k: 'T0', label: 'Temperatura inicial del hielo', min: -30, max: -1, step: 1, val: -20, unit: '°C', d: 0 },
      { k: 'P', label: 'Potencia de la hornalla', min: 500, max: 3000, step: 100, val: 1500, unit: 'W', d: 0 }
    ], () => { Qn = 0; });
    const br = buttons(ctx.panel, [['⏸ Pausa', b => { run = !run; b.textContent = run ? '⏸ Pausa' : '▶ Seguir'; }, 'primary'], ['↺ Reiniciar', () => { Qn = 0; }]]);
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .7 : .45, () => { });
    const bar = makeCanvas(ctx.stage, w => w < 600 ? .28 : .12, () => { });
    animate(cv, dt => {
      const m = S.m, st = [
        { n: 'Calentar hielo', q: m * 2100 * (0 - S.T0), lat: false, col: '#7fc4ff' },
        { n: 'Fusión', q: m * 334000, lat: true, col: '#3d8fe0' },
        { n: 'Calentar agua', q: m * 4186 * 100, lat: false, col: '#2bb673' },
        { n: 'Ebullición', q: m * 2.26e6, lat: true, col: '#e0483e' },
        { n: 'Calentar vapor', q: m * 2010 * 20, lat: false, col: '#f08a24' }
      ];
      const Qt = st.reduce((a, s) => a + s.q, 0);
      if (run) Qn = Math.min(Qt, Qn + dt * Qt / 24);
      const Tof = Q => { let acc = 0; const T = [S.T0, 0, 0, 100, 100, 120]; for (let i = 0; i < st.length; i++) { if (Q <= acc + st[i].q) { const f = (Q - acc) / st[i].q; return { T: st[i].lat ? T[i + 1] : lerp(T[i], T[i + 1], f), i, f }; } acc += st[i].q; } return { T: 120, i: 4, f: 1 }; };
      const c = cv.ctx; D.clear(cv);
      const tmax = Qt / S.P / 60;
      const pts = []; for (let k = 0; k <= 300; k++) { const Q = Qt * k / 300; pts.push([Q / S.P / 60, Tof(Q).T]); }
      const cur = Tof(Qn), tm = Qn / S.P / 60;
      const r = { x: 50, y: 24, w: cv.w - 70, h: cv.h - 56 };
      const { X, Y } = D.plot(c, r, [{ pts, color: cssv('--muted'), w: 1.5, dash: [4, 4] }, { pts: pts.filter(p => p[0] <= tm), color: cssv('--hot'), w: 3 }], { x0: 0, x1: tmax, y0: -40, y1: 130, xl: 'tiempo (minutos)', yl: 'Temperatura (°C)', xd: 0 });
      c.fillStyle = cssv('--hot'); c.beginPath(); c.arc(X(tm), Y(cur.T), 6, 0, 7); c.fill();
      D.text(c, ['🧊 sólido', '🧊💧 sólido + líquido', '💧 líquido', '💧♨️ líquido + vapor', '♨️ vapor'][cur.i], X(tm) + 10, Y(cur.T) - 14, { size: 12, weight: 700 });
      // barra de energía por etapa
      const b = bar.ctx; D.clear(bar);
      let x = 10; const bw = bar.w - 20;
      st.forEach((s, i) => {
        const w = s.q / Qt * bw;
        b.fillStyle = s.col; b.globalAlpha = .25; b.fillRect(x, 18, w, bar.h - 40); b.globalAlpha = 1;
        const done = clamp((Qn - st.slice(0, i).reduce((a, z) => a + z.q, 0)) / s.q, 0, 1);
        b.fillStyle = s.col; b.fillRect(x, 18, w * done, bar.h - 40);
        if (w > 60) D.text(b, s.n + (s.lat ? ' (latente)' : ''), x + w / 2, bar.h - 10, { align: 'center', size: 10, weight: 600 });
        x += w;
      });
      D.text(b, 'Energía de cada etapa (ancho proporcional)', 10, 8, { size: 11, weight: 700, color: cssv('--muted') });
      ctx.reads([['Tiempo', fmt(tm, 1) + ' min'], ['Temperatura', fu(cur.T, '°C', 1), tempColor(cur.T, -20, 120)], ['Etapa', st[cur.i].n + (st[cur.i].lat ? ' · calor latente' : ' · calor sensible')], ['Energía entregada', fu(Qn / 1000, 'kJ', 0), cssv('--ec')], ['Energía total del proceso', fu(Qt / 1000, 'kJ', 0)]]);
    });
  }
});

/* ---------- 12. Primera ley y máquinas térmicas ---------- */
defSim({
  id: 'maquina', icon: '⚙️', title: 'Primera ley y máquinas térmicas',
  short: 'ΔU = Q − W y el rendimiento máximo de Carnot',
  desc: 'La primera ley de la termodinámica es la conservación de la energía: el calor que recibe un sistema se usa para aumentar su energía interna o para realizar trabajo. Una máquina térmica transforma parte del calor en trabajo, pero siempre debe ceder calor a una fuente fría.',
  formulas: [['ΔU = Q − W', 'Q > 0: el sistema recibe calor · W > 0: el sistema realiza trabajo'], ['η = W / Qc = 1 − Qf / Qc', 'rendimiento de una máquina térmica'], ['η Carnot = 1 − Tf / Tc', 'máximo posible (temperaturas en kelvin)']],
  think: ['¿Puede una máquina térmica tener un rendimiento del 100 %? ¿Por qué?', '¿Por qué las centrales térmicas están cerca de ríos o lagos?', '¿Qué ocurre con la energía interna de un gas si se comprime sin intercambiar calor?', 'En la central Embalse, ¿cuál es la fuente caliente y cuál la fría?'],
  tabs: [
    { id: 'ley', label: '🔥 Primera ley', mount: leyMount },
    { id: 'maq', label: '🏭 Máquina térmica', mount: maqMount }
  ]
});
function leyMount(ctx) {
  heading(ctx.panel, 'Sistema: gas en un cilindro');
  const S = controls(ctx.panel, [
    { k: 'Q', label: 'Calor Q', min: -1000, max: 1000, step: 10, val: 500, unit: 'J', d: 0 },
    { k: 'W', label: 'Trabajo realizado por el gas W', min: -1000, max: 1000, step: 10, val: 200, unit: 'J', d: 0 }
  ], () => draw());
  heading(ctx.panel, 'Procesos');
  buttons(ctx.panel, [['Volumen constante', () => S.set({ Q: 500, W: 0 })], ['Isotérmico', () => S.set({ Q: 500, W: 500 })], ['Compresión adiabática', () => S.set({ Q: 0, W: -400 })], ['Expansión adiabática', () => S.set({ Q: 0, W: 300 })]]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .85 : .5, () => draw());
  function draw() {
    if (!S) return;
    const dU = S.Q - S.W, c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const cx = W / 2, cw = Math.min(180, W * .35), base = H - 50, h0 = H * .38, h = clamp(h0 + S.W / 1000 * H * .22, 40, H - 90);
    c.fillStyle = tempColor(50 + dU / 20, 0, 100); c.globalAlpha = .55; c.fillRect(cx - cw / 2, base - h, cw, h); c.globalAlpha = 1;
    c.strokeStyle = cssv('--ink'); c.lineWidth = 4; c.beginPath(); c.moveTo(cx - cw / 2, base - h - 60); c.lineTo(cx - cw / 2, base); c.lineTo(cx + cw / 2, base); c.lineTo(cx + cw / 2, base - h - 60); c.stroke();
    c.fillStyle = cssv('--muted'); c.fillRect(cx - cw / 2 + 3, base - h - 12, cw - 6, 12); c.fillRect(cx - 6, base - h - 60, 12, 48);
    D.text(c, 'gas', cx, base - h / 2, { align: 'center', weight: 700, size: 15 });
    D.text(c, 'ΔU = ' + fmt(dU, 0) + ' J', cx, base - h / 2 + 20, { align: 'center', weight: 700, color: dU >= 0 ? cssv('--hot') : cssv('--cold') });
    if (S.Q) { const up = S.Q > 0; D.arrow(c, cx, up ? H - 4 : base + 4, cx, up ? base + 4 : H - 4, up ? cssv('--hot') : cssv('--cold'), clamp(Math.abs(S.Q) / 80, 2, 12)); D.text(c, 'Q = ' + fmt(S.Q, 0) + ' J ' + (up ? '(recibe)' : '(cede)'), cx + 20, H - 18, { weight: 700, color: up ? cssv('--hot') : cssv('--cold') }); }
    if (S.W) { const up = S.W > 0; D.arrow(c, cx + cw / 2 + 30, up ? base - h : base - h - 60, cx + cw / 2 + 30, up ? base - h - 60 : base - h, cssv('--ep'), clamp(Math.abs(S.W) / 80, 2, 12)); D.text(c, 'W = ' + fmt(S.W, 0) + ' J', cx + cw / 2 + 44, base - h - 30, { weight: 700, color: cssv('--ep') }); D.text(c, up ? 'el gas se expande' : 'el gas es comprimido', cx + cw / 2 + 44, base - h - 12, { size: 11, color: cssv('--muted') }); }
    ctx.reads([['Calor Q', fu(S.Q, 'J', 0), cssv('--hot')], ['Trabajo W', fu(S.W, 'J', 0), cssv('--ep')], ['Variación de energía interna ΔU', fu(dU, 'J', 0), dU >= 0 ? cssv('--hot') : cssv('--cold')], ['La temperatura del gas', dU > 0 ? 'aumenta' : dU < 0 ? 'disminuye' : 'no cambia']]);
  }
  draw();
}
function maqMount(ctx) {
  heading(ctx.panel, 'Máquina');
  const S = controls(ctx.panel, [
    { k: 'Tc', label: 'Temperatura fuente caliente', min: 100, max: 1500, step: 10, val: 540, unit: '°C', d: 0 },
    { k: 'Tf', label: 'Temperatura fuente fría', min: 0, max: 100, step: 1, val: 30, unit: '°C', d: 0 },
    { k: 'Qc', label: 'Calor absorbido por ciclo', min: 100, max: 5000, step: 100, val: 1000, unit: 'J', d: 0 },
    { k: 'fr', label: 'Calidad de la máquina (% del ideal)', min: 20, max: 100, step: 1, val: 70, unit: '%', d: 0 }
  ], () => draw());
  heading(ctx.panel, 'Ejemplos');
  buttons(ctx.panel, [['Central de vapor', () => S.set({ Tc: 540, Tf: 30, fr: 70 })], ['Central nuclear', () => S.set({ Tc: 290, Tf: 25, fr: 72 })], ['Motor de auto', () => S.set({ Tc: 1200, Tf: 90, fr: 35 })], ['Máquina ideal (Carnot)', () => S.set({ fr: 100 })]]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? 1 : .55, () => draw());
  function draw() {
    if (!S) return;
    const Tc = S.Tc + 273.15, Tf = S.Tf + 273.15, eC = 1 - Tf / Tc, e = eC * S.fr / 100, Wk = S.Qc * e, Qf = S.Qc - Wk;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const cx = W * .4, bw = Math.min(260, W * .6);
    c.fillStyle = cssv('--hot'); D.rrect(c, cx - bw / 2, 10, bw, 46, 10); c.fill();
    D.text(c, 'Fuente caliente · ' + fmt(S.Tc, 0) + ' °C', cx, 33, { align: 'center', weight: 700, color: '#fff' });
    c.fillStyle = cssv('--cold'); D.rrect(c, cx - bw / 2, H - 56, bw, 46, 10); c.fill();
    D.text(c, 'Fuente fría · ' + fmt(S.Tf, 0) + ' °C', cx, H - 33, { align: 'center', weight: 700, color: '#fff' });
    c.fillStyle = cssv('--soft'); c.strokeStyle = cssv('--ink'); c.lineWidth = 2; c.beginPath(); c.arc(cx, H / 2, 42, 0, 7); c.fill(); c.stroke();
    D.text(c, 'máquina', cx, H / 2, { align: 'center', weight: 700 });
    const sc = 26 / S.Qc;
    D.arrow(c, cx, 58, cx, H / 2 - 44, cssv('--hot'), Math.max(S.Qc * sc, 2), 16);
    D.text(c, 'Qc = ' + fmt(S.Qc, 0) + ' J', cx + 24, H * .27, { weight: 700, color: cssv('--hot') });
    D.arrow(c, cx, H / 2 + 44, cx, H - 58, cssv('--cold'), Math.max(Qf * sc, 2), 16);
    D.text(c, 'Qf = ' + fmt(Qf, 0) + ' J', cx + 24, H * .73, { weight: 700, color: cssv('--cold') });
    D.arrow(c, cx + 44, H / 2, Math.min(W - 20, cx + 44 + W * .35), H / 2, cssv('--ok'), Math.max(Wk * sc, 2), 16);
    D.text(c, 'W = ' + fmt(Wk, 0) + ' J (trabajo útil)', cx + 52, H / 2 - 24, { weight: 700, color: cssv('--ok') });
    ctx.reads([['Rendimiento de Carnot (máximo)', fmt(eC * 100, 1) + ' %', cssv('--ep')], ['Rendimiento real', fmt(e * 100, 1) + ' %', cssv('--ok')], ['Trabajo por ciclo', fu(Wk, 'J', 0), cssv('--ok')], ['Calor cedido a la fuente fría', fu(Qf, 'J', 0), cssv('--cold')]]);
  }
  draw();
}

/* ---------- 13. Escalas termométricas y dilatación ---------- */
const ALPHA = { acero: ['Acero', 12e-6], aluminio: ['Aluminio', 23e-6], cobre: ['Cobre', 17e-6], hormigon: ['Hormigón', 12e-6], vidrio: ['Vidrio común', 9e-6], pyrex: ['Vidrio Pyrex', 3.2e-6] };
defSim({
  id: 'escalas', icon: '🌡️', title: 'Temperatura, escalas y dilatación',
  short: 'Celsius, Fahrenheit y Kelvin · dilatación de sólidos',
  desc: 'La temperatura mide la agitación de las partículas. Se expresa en distintas escalas. Cuando un cuerpo se calienta, sus partículas se separan un poco más y el cuerpo se dilata: por eso las vías y los puentes tienen juntas de dilatación.',
  formulas: [['°F = 1,8 · °C + 32', ''], ['K = °C + 273,15', 'el cero absoluto es 0 K = −273,15 °C'], ['ΔL = α · L₀ · ΔT', 'dilatación lineal (α: coeficiente, 1/°C)'], ['β ≈ 2α (superficial) · γ ≈ 3α (volumétrica)', '']],
  think: ['¿A qué temperatura coinciden las escalas Celsius y Fahrenheit?', '¿Por qué no existen temperaturas por debajo de 0 K?', '¿Por qué las vías del tren tienen pequeñas separaciones entre rieles?', '¿Por qué un vaso de vidrio común puede romperse si le echás agua hirviendo, y uno de Pyrex no?'],
  tabs: [
    { id: 'esc', label: '🌡️ Escalas', mount: escMount },
    { id: 'dil', label: '🛤️ Dilatación', mount: dilMount }
  ]
});
function escMount(ctx) {
  heading(ctx.panel, 'Temperatura');
  const S = controls(ctx.panel, [{ k: 'c', label: 'Temperatura', min: -273.15, max: 200, step: .05, val: 25, unit: '°C', d: 1 }], () => draw());
  buttons(ctx.panel, [['Cero absoluto', () => S.set({ c: -273.15 })], ['Fusión del hielo', () => S.set({ c: 0 })], ['Cuerpo humano', () => S.set({ c: 36.5 })], ['Ebullición del agua', () => S.set({ c: 100 })], ['−40', () => S.set({ c: -40 })]]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? 1 : .55, () => draw());
  function draw() {
    if (!S) return;
    const C = S.c, F = C * 1.8 + 32, K = C + 273.15;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const top = 30, bot = H - 50, Y = cc => bot - (cc + 273.15) / 473.15 * (bot - top);
    const sc = [['Celsius', '°C', v => v, C], ['Fahrenheit', '°F', v => v * 1.8 + 32, F], ['Kelvin', 'K', v => v + 273.15, K]];
    sc.forEach(([n, u, f, val], i) => {
      const x = W * (i + .5) / 3;
      c.fillStyle = cssv('--soft'); D.rrect(c, x - 12, top - 10, 24, bot - top + 20, 12); c.fill();
      c.fillStyle = tempColor(C, -40, 120); c.fillRect(x - 6, Y(C), 12, bot - Y(C) + 8);
      c.beginPath(); c.arc(x, bot + 14, 16, 0, 7); c.fill();
      [-273.15, 0, 36.5, 100].forEach(ref => { const y = Y(ref); c.strokeStyle = cssv('--muted'); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 14, y); c.lineTo(x + 22, y); c.stroke(); D.text(c, fmt(f(ref), 1), x + 26, y, { size: 11, color: cssv('--muted') }); });
      D.text(c, n, x, 10, { align: 'center', weight: 700 });
      D.text(c, fmt(val, 1) + ' ' + u, x - 18, Y(C), { align: 'right', weight: 700, size: 14, color: cssv('--ink') });
    });
    ctx.reads([['Celsius', fu(C, '°C', 2)], ['Fahrenheit', fu(F, '°F', 2), cssv('--ec')], ['Kelvin', fu(K, 'K', 2), cssv('--ep')]]);
  }
  draw();
}
function dilMount(ctx) {
  heading(ctx.panel, 'Barra');
  const S = controls(ctx.panel, [
    { k: 'm', label: 'Material', type: 'select', val: 'acero', options: Object.entries(ALPHA).map(([k, v]) => [k, v[0] + ' (α = ' + fmt(v[1] * 1e6, 1) + ' × 10⁻⁶ /°C)']) },
    { k: 'L', label: 'Longitud inicial L₀', min: 1, max: 200, step: 1, val: 12, unit: 'm', d: 0 },
    { k: 'T0', label: 'Temperatura inicial', min: -20, max: 40, step: 1, val: 5, unit: '°C', d: 0 },
    { k: 'T1', label: 'Temperatura final', min: -20, max: 80, step: 1, val: 55, unit: '°C', d: 0 }
  ], () => draw());
  buttons(ctx.panel, [['Riel de tren (12 m)', () => S.set({ m: 'acero', L: 12, T0: -5, T1: 60 })], ['Puente de hormigón (100 m)', () => S.set({ m: 'hormigon', L: 100, T0: -5, T1: 45 })], ['Cable de aluminio (200 m)', () => S.set({ m: 'aluminio', L: 200, T0: 0, T1: 40 })]]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .6 : .38, () => draw());
  function draw() {
    if (!S) return;
    const a = ALPHA[S.m][1], dT = S.T1 - S.T0, dL = a * S.L * dT;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const x0 = 30, base = W * .55, amp = Math.abs(a * dT) > 0 ? Math.max(1, Math.round(.25 / Math.abs(a * dT))) : 1;
    const L1 = base * (1 + a * dT * amp);
    c.fillStyle = tempColor(S.T0, -20, 80); D.rrect(c, x0, H * .25, base, 26, 6); c.fill();
    c.fillStyle = tempColor(S.T1, -20, 80); D.rrect(c, x0, H * .6, Math.max(L1, 10), 26, 6); c.fill();
    D.text(c, fmt(S.T0, 0) + ' °C · ' + fmt(S.L, 2) + ' m', x0, H * .25 - 14, { weight: 600 });
    D.text(c, fmt(S.T1, 0) + ' °C · ' + fmt(S.L + dL, 4) + ' m', x0, H * .6 - 14, { weight: 600 });
    c.setLineDash([4, 4]); c.strokeStyle = cssv('--muted'); c.beginPath(); c.moveTo(x0 + base, H * .2); c.lineTo(x0 + base, H * .6 + 40); c.stroke(); c.setLineDash([]);
    D.text(c, 'diferencia exagerada ' + fmt(amp, 0) + ' veces para que se vea', W - 10, H - 12, { align: 'right', size: 11, color: cssv('--muted') });
    ctx.reads([['ΔT', fu(dT, '°C', 0)], ['Variación de longitud ΔL', fmt(dL * 1000, 2) + ' mm', dL >= 0 ? cssv('--hot') : cssv('--cold')], ['Longitud final', fu(S.L + dL, 'm', 4)], ['Variación porcentual', fmt(a * dT * 100, 4) + ' %']]);
  }
  draw();
}
