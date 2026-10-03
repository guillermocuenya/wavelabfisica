/* ===== Simuladores: Kepler, movimiento aparente del Sol, energía solar en casa, efecto invernadero ===== */

/* ---------- 6. Leyes de Kepler ---------- */
const PLANETS = [['Mercurio', .387, .241, .206], ['Venus', .723, .615, .007], ['Tierra', 1, 1, .0167], ['Marte', 1.524, 1.881, .093], ['Júpiter', 5.203, 11.86, .049], ['Saturno', 9.537, 29.46, .057], ['Urano', 19.19, 84.01, .046], ['Neptuno', 30.07, 164.8, .010]];
defSim({
  id: 'kepler', icon: '🪐', title: 'Leyes de Kepler',
  short: 'Órbitas elípticas, áreas iguales en tiempos iguales y T² ∝ a³',
  desc: 'Los planetas giran en órbitas elípticas con el Sol en uno de los focos. Cerca del Sol (perihelio) van más rápido y lejos (afelio) más lento, de modo que barren áreas iguales en tiempos iguales.',
  formulas: [['1ª ley: órbita elíptica, Sol en un foco', 'excentricidad e = c / a (0 = círculo)'], ['2ª ley: A₁ = A₂ en tiempos iguales', 'velocidad areolar constante'], ['3ª ley: T² / a³ = constante', 'T en años y a en UA: T² / a³ ≈ 1 para el sistema solar'], ['r perihelio = a(1 − e) · r afelio = a(1 + e)', '']],
  think: ['¿En qué parte de la órbita el planeta va más rápido? ¿Cómo lo explica la 2ª ley?', 'La órbita de la Tierra es casi circular (e ≈ 0,017). ¿Pueden las estaciones deberse a la distancia al Sol?', 'En enero la Tierra está en el perihelio. ¿Qué estación es en Córdoba? ¿Y en España?', 'Calculá T²/a³ para varios planetas. ¿Qué observás?'],
  mount(ctx) {
    heading(ctx.panel, 'Órbita');
    let M = 0;
    const S = controls(ctx.panel, [
      { k: 'e', label: 'Excentricidad e', min: 0, max: .95, step: .005, val: .5, d: 3 },
      { k: 'sp', label: 'Velocidad de la animación', min: .2, max: 3, step: .1, val: 1, fmt: v => fmt(v, 1) + '×' },
      { k: 'areas', label: 'Mostrar áreas (2ª ley)', type: 'check', val: true }
    ]);
    heading(ctx.panel, 'Ejemplos');
    buttons(ctx.panel, [['Tierra', () => S.set({ e: .0167 })], ['Marte', () => S.set({ e: .093 })], ['Mercurio', () => S.set({ e: .206 })], ['Cometa', () => S.set({ e: .9 })]]);
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .55, () => { });
    html(ctx.stage, `<h3 style="margin:14px 4px 8px;font-size:1.05rem">3ª ley en el sistema solar</h3><div class="scroll-x"><table class="t"><thead><tr><th>Planeta</th><th>a (UA)</th><th>T (años)</th><th>T²</th><th>a³</th><th>T² / a³</th></tr></thead><tbody>${PLANETS.map(p => `<tr><td>${p[0]}</td><td class="n">${fmt(p[1], 3)}</td><td class="n">${fmt(p[2], 3)}</td><td class="n">${fmt(p[2] ** 2, 2)}</td><td class="n">${fmt(p[1] ** 3, 2)}</td><td class="n"><b>${fmt(p[2] ** 2 / p[1] ** 3, 3)}</b></td></tr>`).join('')}</tbody></table></div>`);
    const solveE = (Mm, e) => { let E = e > .8 ? Math.PI : Mm; for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - Mm) / (1 - e * Math.cos(E)); return E; };
    animate(cv, dt => {
      const e = S.e, c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      M = (M + dt * S.sp * 2 * Math.PI / 12) % (2 * Math.PI);
      const b = Math.sqrt(1 - e * e);
      const sc = Math.min((W - 40) / (2), (H - 40) / (2 * b));
      const cx = W / 2 + e * sc, cy = H / 2; // foco (Sol) en el origen
      const P = Mm => { const E = solveE(Mm, e); return [cx + sc * (Math.cos(E) - e), cy - sc * b * Math.sin(E), 1 - e * Math.cos(E)]; };
      // áreas iguales
      const N = 12, cur = Math.floor(M / (2 * Math.PI) * N);
      if (S.areas) for (let k = 0; k < N; k++) {
        c.beginPath(); c.moveTo(cx, cy);
        for (let j = 0; j <= 20; j++) { const p = P(2 * Math.PI * (k + j / 20) / N); c.lineTo(p[0], p[1]); }
        c.closePath(); c.fillStyle = k === cur ? cssv('--ec') : (k % 2 ? cssv('--accent-soft') : cssv('--soft')); c.globalAlpha = k === cur ? .55 : 1; c.fill(); c.globalAlpha = 1;
      }
      // órbita
      c.beginPath(); c.ellipse(cx - e * sc, cy, sc, sc * b, 0, 0, 7); c.strokeStyle = cssv('--muted'); c.lineWidth = 1.5; c.stroke();
      // focos y ejes
      c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - e * sc - sc, cy); c.lineTo(cx - e * sc + sc, cy); c.strokeStyle = cssv('--grid'); c.stroke(); c.setLineDash([]);
      c.fillStyle = cssv('--muted'); c.beginPath(); c.arc(cx - 2 * e * sc, cy, 3, 0, 7); c.fill();
      const gS = c.createRadialGradient(cx, cy, 2, cx, cy, 18); gS.addColorStop(0, '#fff6c2'); gS.addColorStop(1, cssv('--sun'));
      c.fillStyle = gS; c.beginPath(); c.arc(cx, cy, 14, 0, 7); c.fill();
      D.text(c, 'Sol (foco)', cx, cy + 26, { align: 'center', size: 11, weight: 600 });
      D.text(c, 'perihelio', cx - e * sc + sc - 4, cy - 10, { align: 'right', size: 11, color: cssv('--muted') });
      D.text(c, 'afelio', cx - e * sc - sc + 4, cy - 10, { size: 11, color: cssv('--muted') });
      // planeta
      const p = P(M), r = p[2];
      c.strokeStyle = cssv('--ep'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(p[0], p[1]); c.stroke();
      c.fillStyle = cssv('--ep'); c.beginPath(); c.arc(p[0], p[1], 9, 0, 7); c.fill();
      const v = Math.sqrt(2 / r - 1);
      ctx.reads([['Distancia al Sol', fmt(r, 3) + ' a', cssv('--ep')], ['Velocidad (respecto de una órbita circular)', fmt(v, 2) + ' ×', cssv('--ec')], ['Perihelio', fmt(1 - e, 3) + ' a'], ['Afelio', fmt(1 + e, 3) + ' a'], ['Cociente afelio / perihelio', fmt((1 + e) / (1 - e), 2)]]);
    });
  }
});

/* ---------- 7. Movimiento aparente del Sol y estaciones ---------- */
const CITIES = [['Río Cuarto', -33.13], ['Ushuaia', -54.8], ['Salta', -24.8], ['Quito (Ecuador)', -.2], ['Madrid (España)', 40.4], ['Polo Sur', -89.9]];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dayLabel = n => { const d = new Date(2026, 0, n); return d.getDate() + ' de ' + MONTHS[d.getMonth()]; };
const decl = n => -23.44 * Math.cos(2 * Math.PI * (n + 10) / 365);
const RAD = Math.PI / 180;
function sunPos(lat, dec, hour) {
  const H = (hour - 12) * 15 * RAD, f = lat * RAD, d = dec * RAD;
  const sh = Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(H);
  const el = Math.asin(clamp(sh, -1, 1));
  const az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.cos(f) * Math.sin(d) - Math.sin(f) * Math.cos(d) * Math.cos(H));
  return { el: el / RAD, az: ((az / RAD) + 360) % 360 };
}
const clearSky = el => el <= 0 ? 0 : 1361 * Math.pow(.7, Math.pow(1 / Math.sin(el * RAD), .678)) * Math.sin(el * RAD);
function seasonOf(n, lat) {
  const s = n < 79 || n >= 355 ? 0 : n < 172 ? 1 : n < 265 ? 2 : 3; // 0: dic-mar
  const south = ['verano', 'otoño', 'invierno', 'primavera'], north = ['invierno', 'primavera', 'verano', 'otoño'];
  return Math.abs(lat) < 10 ? 'casi sin estaciones (zona ecuatorial)' : (lat < 0 ? south : north)[s];
}
defSim({
  id: 'sol', icon: '🌅', title: 'Movimiento aparente del Sol y estaciones',
  short: 'Trayectoria del Sol en el cielo según el lugar y la fecha',
  desc: 'Visto desde la Tierra, el Sol sale por el este y se pone por el oeste, pero su altura y la duración del día cambian a lo largo del año. La causa es la inclinación del eje terrestre (23,44°): cambia el ángulo con que llegan los rayos y las horas de luz.',
  formulas: [['δ ≈ −23,44° · cos(360° · (N + 10) / 365)', 'declinación solar (N: día del año)'], ['h mediodía = 90° − |φ − δ|', 'altura máxima del Sol (φ: latitud)'], ['I ≈ I₀ · sen h', 'cuanto más alto el Sol, más energía por m²']],
  think: ['¿Por qué en verano los días son más largos y hace más calor?', 'Compará la altura del Sol al mediodía en Río Cuarto en diciembre y en junio.', '¿Qué pasa en Ushuaia en junio? ¿Y en el Polo Sur?', '¿Hacia qué punto cardinal conviene orientar un panel solar en Córdoba? ¿Por qué?', '¿Por qué en Quito casi no hay estaciones?'],
  mount(ctx) {
    heading(ctx.panel, 'Lugar y fecha');
    const S = controls(ctx.panel, [
      { k: 'lat', label: 'Latitud', min: -89.9, max: 89.9, step: .1, val: -33.13, fmt: v => fmt(Math.abs(v), 1) + '° ' + (v < 0 ? 'S' : 'N') },
      { k: 'n', label: 'Fecha', min: 1, max: 365, step: 1, val: 355, fmt: dayLabel },
      { k: 'hr', label: 'Hora solar', min: 0, max: 24, step: .25, val: 12, fmt: v => String(Math.floor(v)).padStart(2, '0') + ':' + String(Math.round((v % 1) * 60)).padStart(2, '0') },
      { k: 'play', label: 'Animar el día', type: 'check', val: false }
    ], () => draw());
    heading(ctx.panel, 'Ciudades');
    buttons(ctx.panel, CITIES.map(([n, l]) => [n, () => S.set({ lat: l })]));
    heading(ctx.panel, 'Fechas clave');
    buttons(ctx.panel, [['Solst. diciembre', () => S.set({ n: 355 })], ['Equinoccio', () => S.set({ n: 80 })], ['Solst. junio', () => S.set({ n: 172 })]]);
    html(ctx.panel, 'Hora solar: las 12 h es cuando el Sol está más alto. En Córdoba la hora del reloj va aproximadamente 1 h 15 min adelantada respecto de la hora solar.', 'muted');
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .5, () => draw());
    function draw() {
      if (!S) return;
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const south = S.lat < 0, hy = H * .78, top = 24, pad = 30;
      const X = az => { let rel = south ? ((az + 180) % 360) - 180 : az - 180; return W / 2 + rel / 180 * (W / 2 - pad); };
      const Y = el => hy - el / 90 * (hy - top);
      // cielo y suelo
      const sky = c.createLinearGradient(0, top, 0, hy); sky.addColorStop(0, cssv('--accent-soft')); sky.addColorStop(1, cssv('--card'));
      c.fillStyle = sky; c.fillRect(0, 0, W, hy);
      c.fillStyle = cssv('--soft'); c.fillRect(0, hy, W, H - hy);
      c.strokeStyle = cssv('--muted'); c.lineWidth = 2; c.beginPath(); c.moveTo(0, hy); c.lineTo(W, hy); c.stroke();
      for (let el = 30; el <= 90; el += 30) { c.strokeStyle = cssv('--grid'); c.lineWidth = 1; c.setLineDash([3, 5]); c.beginPath(); c.moveTo(pad, Y(el)); c.lineTo(W - pad, Y(el)); c.stroke(); c.setLineDash([]); D.text(c, el + '°', 6, Y(el), { size: 10, color: cssv('--muted') }); }
      [['N', 0], ['E', 90], ['S', 180], ['O', 270]].forEach(([l, a]) => D.text(c, l, X(a), hy + 16, { align: 'center', size: 14, weight: 700, font: 'Space Grotesk, sans-serif' }));
      D.text(c, south ? 'mirando hacia el norte' : 'mirando hacia el sur', W / 2, H - 12, { align: 'center', size: 11, color: cssv('--muted') });
      const path = (n, color, w, dash) => {
        const d = decl(n); c.strokeStyle = color; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); let started = false, prevX = null;
        for (let h = 0; h <= 24; h += .1) {
          const p = sunPos(S.lat, d, h); if (p.el < -1) { started = false; continue; }
          const x = X(p.az), y = Y(Math.max(p.el, 0));
          if (started && prevX !== null && Math.abs(x - prevX) > W * .5) started = false;
          started ? c.lineTo(x, y) : c.moveTo(x, y); started = true; prevX = x;
        }
        c.stroke(); c.setLineDash([]);
      };
      path(355, cssv('--ec'), 1.5, [5, 4]); path(172, cssv('--ep'), 1.5, [5, 4]); path(80, cssv('--muted'), 1.2, [2, 4]);
      path(S.n, cssv('--sun'), 3.5);
      const dec = decl(S.n), p = sunPos(S.lat, dec, S.hr);
      if (p.el > -2) {
        const gS = c.createRadialGradient(X(p.az), Y(p.el), 2, X(p.az), Y(p.el), 18); gS.addColorStop(0, '#fff7c9'); gS.addColorStop(1, cssv('--sun'));
        c.fillStyle = gS; c.beginPath(); c.arc(X(p.az), Y(Math.max(p.el, -1)), 13, 0, 7); c.fill();
      }
      // leyenda
      [[cssv('--ec'), '21 dic'], [cssv('--muted'), 'equinoccio'], [cssv('--ep'), '21 jun'], [cssv('--sun'), 'día elegido']].forEach(([col, l], i) => { c.fillStyle = col; c.fillRect(W - 120, 14 + i * 16, 14, 4); D.text(c, l, W - 100, 16 + i * 16, { size: 11 }); });
      // datos del día
      const w0 = -Math.tan(S.lat * RAD) * Math.tan(dec * RAD);
      const dayLen = w0 <= -1 ? 24 : w0 >= 1 ? 0 : 2 * Math.acos(w0) / RAD / 15;
      const noon = sunPos(S.lat, dec, 12).el;
      let ins = 0; for (let h = 0; h < 24; h += .1) ins += clearSky(sunPos(S.lat, dec, h).el) * .1;
      ctx.reads([
        ['Altura del Sol ahora', p.el > 0 ? fmt(p.el, 1) + '°' : 'de noche', cssv('--sun')],
        ['Altura al mediodía', fmt(Math.max(noon, 0), 1) + '°', cssv('--ec')],
        ['Horas de luz', fmt(dayLen, 1) + ' h'],
        ['Radiación ahora (cielo despejado)', fu(clearSky(p.el), 'W/m²', 0)],
        ['Energía del día por m²', fu(ins / 1000, 'kWh/m²', 1), cssv('--ok')],
        ['Estación', seasonOf(S.n, S.lat)]
      ]);
    }
    let acc = 0;
    animate(cv, dt => { if (S.play) { acc += dt; if (acc > .04) { S.set({ hr: (S.hr + .1) % 24 }, true); acc = 0; draw(); } } });
  }
});

/* ---------- 8. Energía solar en casa ---------- */
const GHI_CBA = [7.0, 6.2, 5.2, 4.0, 3.0, 2.5, 2.8, 3.6, 4.7, 5.8, 6.7, 7.2]; // kWh/m²·día aprox. centro de Córdoba
const TFRIA = [24, 23, 21, 18, 15, 12, 11, 13, 15, 18, 21, 23];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MESES3 = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
function monthBars(c, st, a, b, la, lb, unit) {
  const W = st.w, H = st.h, x0 = 50, y0 = 26, w = W - 64, h = H - 72;
  const max = Math.max(...a, ...b) * 1.1 || 1;
  c.strokeStyle = cssv('--grid'); for (let i = 0; i <= 4; i++) { const y = y0 + h - h * i / 4; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); D.text(c, fmt(max * i / 4, 0), x0 - 6, y, { align: 'right', size: 10, color: cssv('--muted') }); }
  const gw = w / 12;
  for (let m = 0; m < 12; m++) {
    const bx = x0 + m * gw + gw * .12, bw = gw * .36;
    c.fillStyle = cssv('--muted'); c.globalAlpha = .45; D.rrect(c, bx, y0 + h - a[m] / max * h, bw, a[m] / max * h, 3); c.fill(); c.globalAlpha = 1;
    c.fillStyle = cssv('--sun'); D.rrect(c, bx + bw + 2, y0 + h - b[m] / max * h, bw, b[m] / max * h, 3); c.fill();
    D.text(c, MESES3[m], x0 + m * gw + gw / 2, y0 + h + 12, { align: 'center', size: 10, color: cssv('--muted') });
  }
  c.fillStyle = cssv('--muted'); c.globalAlpha = .45; c.fillRect(x0, 8, 12, 8); c.globalAlpha = 1; D.text(c, la, x0 + 16, 12, { size: 11 });
  const lx = x0 + Math.min(170, w * .5); c.fillStyle = cssv('--sun'); c.fillRect(lx, 8, 12, 8); D.text(c, lb, lx + 16, 12, { size: 11 });
  D.text(c, unit, W - 8, y0 + h + 30, { align: 'right', size: 11, weight: 600, color: cssv('--muted') });
}
defSim({
  id: 'solarcasa', icon: '🏡', title: 'Energía solar en casa',
  short: 'Termotanque solar y paneles fotovoltaicos mes a mes',
  desc: 'Dimensioná un termotanque solar para calentar agua y un sistema de paneles fotovoltaicos para generar electricidad. Los resultados cambian mes a mes porque la radiación solar varía con las estaciones.',
  formulas: [['Q = m · c · ΔT', 'energía para calentar el agua (c agua = 4186 J/kg·°C)'], ['E colector = G · A · η', 'G: radiación diaria (kWh/m²), A: área, η: rendimiento'], ['E paneles = P pico · HSP · (1 − pérdidas)', 'HSP: horas de sol pico ≈ radiación diaria en kWh/m²'], ['1 m³ de gas ≈ 10,8 kWh', 'poder calorífico aproximado del gas natural']],
  think: ['¿En qué meses el termotanque solar cubre todo el consumo? ¿Por qué?', '¿Cuántos paneles necesitaría tu casa para cubrir el consumo anual?', '¿Por qué conviene inclinar los paneles hacia el norte en Córdoba?', 'Analizá el ciclo de vida de un panel solar: fabricación, uso (25 años) y descarte.', '¿Qué es el "frío solar"? Investigá cómo funciona una máquina de absorción.'],
  tabs: [
    { id: 'termo', label: '🚿 Termotanque solar', mount: termoMount },
    { id: 'fv', label: '🔆 Paneles fotovoltaicos', mount: fvMount }
  ]
});
function termoMount(ctx) {
  heading(ctx.panel, 'Tu casa');
  const S = controls(ctx.panel, [
    { k: 'p', label: 'Personas', min: 1, max: 8, step: 1, val: 4, d: 0 },
    { k: 'l', label: 'Agua caliente por persona', min: 20, max: 80, step: 5, val: 50, unit: 'L/día' },
    { k: 't', label: 'Temperatura deseada', min: 40, max: 60, step: 1, val: 45, unit: '°C' },
    { k: 'a', label: 'Área del colector', min: 1, max: 6, step: .5, val: 3, unit: 'm²' },
    { k: 'eta', label: 'Rendimiento del colector', min: 30, max: 70, step: 1, val: 50, unit: '%' }
  ], () => draw());
  html(ctx.panel, 'Radiación y temperatura del agua fría: valores aproximados para el centro de Córdoba.', 'muted');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .45, () => draw());
  function draw() {
    if (!S) return;
    const need = [], sun = [];
    for (let m = 0; m < 12; m++) {
      need.push(S.p * S.l * 4186 * Math.max(S.t - TFRIA[m], 0) / 3.6e6);
      sun.push(GHI_CBA[m] * S.a * S.eta / 100);
    }
    const c = cv.ctx; D.clear(cv);
    monthBars(c, cv, need, sun, 'Energía necesaria', 'Aporte solar', 'kWh por día');
    let needY = 0, solarY = 0; for (let m = 0; m < 12; m++) { needY += need[m] * DAYS[m]; solarY += Math.min(need[m], sun[m]) * DAYS[m]; }
    const gas = solarY / 10.8 / .75;
    ctx.reads([['Energía anual necesaria', fu(needY, 'kWh', 0)], ['Cobertura solar anual', fmt(solarY / needY * 100, 0) + ' %', cssv('--sun')], ['Gas ahorrado por año', fu(gas, 'm³', 0), cssv('--ok')], ['Agua por día', fu(S.p * S.l, 'L', 0), cssv('--water')]]);
  }
  draw();
}
function fvMount(ctx) {
  heading(ctx.panel, 'Sistema');
  const S = controls(ctx.panel, [
    { k: 'n', label: 'Cantidad de paneles', min: 1, max: 24, step: 1, val: 6, d: 0 },
    { k: 'w', label: 'Potencia de cada panel', min: 300, max: 600, step: 10, val: 450, unit: 'W' },
    { k: 'loss', label: 'Pérdidas (inversor, cables, calor)', min: 10, max: 30, step: 1, val: 20, unit: '%' },
    { k: 'cons', label: 'Consumo de la casa', min: 100, max: 900, step: 10, val: 250, unit: 'kWh/mes' }
  ], () => draw());
  html(ctx.panel, 'Cada panel ocupa unos 2 m². Con paneles inclinados hacia el norte la generación es algo mayor que la calculada (radiación horizontal).', 'muted');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .75 : .45, () => draw());
  function draw() {
    if (!S) return;
    const gen = [], cons = [];
    for (let m = 0; m < 12; m++) { gen.push(S.n * S.w / 1000 * GHI_CBA[m] * (1 - S.loss / 100) * DAYS[m]); cons.push(S.cons); }
    const c = cv.ctx; D.clear(cv);
    monthBars(c, cv, cons, gen, 'Consumo de la casa', 'Generación solar', 'kWh por mes');
    const g = gen.reduce((a, b) => a + b, 0), k = S.cons * 12;
    ctx.reads([['Potencia instalada', fu(S.n * S.w / 1000, 'kWp', 2)], ['Generación anual', fu(g, 'kWh', 0), cssv('--sun')], ['Cobertura del consumo', fmt(g / k * 100, 0) + ' %', cssv('--ok')], ['Superficie de techo', fu(S.n * 2, 'm²', 0)], ['CO₂ evitado (aprox.)', fu(g * .4, 'kg/año', 0)]]);
  }
  draw();
}

/* ---------- 9. Efecto invernadero ---------- */
const SIGMA = 5.67e-8, S0 = 1361;
defSim({
  id: 'invernadero', icon: '🌡️', title: 'Efecto invernadero',
  short: 'Balance de radiación: albedo, gases de efecto invernadero y temperatura',
  desc: 'La Tierra recibe radiación del Sol (sobre todo visible) y emite radiación infrarroja. Los gases de efecto invernadero (CO₂, vapor de agua, metano) absorben parte de ese infrarrojo y lo reemiten, también hacia abajo: la superficie queda más caliente. Modelo simplificado de una capa.',
  formulas: [['T sin atmósfera = ⁴√( S₀ (1 − α) / 4σ )', 'S₀ = 1361 W/m², α: albedo, σ = 5,67 × 10⁻⁸ W/m²K⁴'], ['T superficie = T sin atmósfera · ⁴√( 2 / (2 − ε) )', 'ε: fracción del infrarrojo que absorbe la atmósfera'], ['Más CO₂ → mayor ε → mayor temperatura', '']],
  think: ['¿Qué temperatura tendría la Tierra sin efecto invernadero? ¿Sería habitable?', '¿El efecto invernadero es malo? ¿Cuál es el problema actual?', 'Si se derrite el hielo polar, ¿qué pasa con el albedo y con la temperatura?', '¿Qué estrategias de mitigación se pueden aplicar desde Córdoba?'],
  mount(ctx) {
    heading(ctx.panel, 'Atmósfera y superficie');
    const S = controls(ctx.panel, [
      { k: 'co2', label: 'CO₂ en la atmósfera', min: 180, max: 1200, step: 5, val: 425, unit: 'ppm', d: 0 },
      { k: 'alb', label: 'Albedo (reflexión)', min: .1, max: .6, step: .01, val: .3, d: 2 },
      { k: 'atm', label: 'Con atmósfera', type: 'check', val: true }
    ], () => { });
    heading(ctx.panel, 'Escenarios');
    buttons(ctx.panel, [['Era glacial (180 ppm)', () => S.set({ co2: 180 })], ['Preindustrial (280)', () => S.set({ co2: 280 })], ['Hoy (≈ 425)', () => S.set({ co2: 425 })], ['Doble de CO₂ (560)', () => S.set({ co2: 560 })]]);
    html(ctx.panel, 'Modelo escolar: no incluye nubes, océanos ni otros efectos. Sirve para entender el mecanismo, no para pronosticar.', 'muted');
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .85 : .55, () => { });
    let ph = 0;
    animate(cv, dt => {
      ph += dt;
      const eps = S.atm ? clamp(.770 + .051 * Math.log2(S.co2 / 280), 0, .99) : 0;
      const Te = Math.pow(S0 * (1 - S.alb) / (4 * SIGMA), .25), Ts = Te * Math.pow(2 / (2 - eps), .25);
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const gy = H * .8, ay0 = H * .3, ay1 = H * .48;
      c.fillStyle = cssv('--card'); c.fillRect(0, 0, W, gy);
      if (S.atm) { c.fillStyle = `rgba(120,140,170,${.12 + eps * .35})`; c.fillRect(0, ay0, W, ay1 - ay0); D.text(c, 'atmósfera (CO₂, vapor de agua, metano)', W - 10, ay0 + 12, { align: 'right', size: 11, color: cssv('--muted') }); }
      c.fillStyle = '#4f7f3a'; c.fillRect(0, gy, W, H - gy); c.fillStyle = tempColor(Ts - 273.15, -20, 35); c.fillRect(0, gy, 8, H - gy);
      D.text(c, 'superficie: ' + fmt(Ts - 273.15, 1) + ' °C', 12, gy + (H - gy) / 2, { size: 15, weight: 700, color: '#fff', font: 'Space Grotesk, sans-serif' });
      // Sol
      c.fillStyle = cssv('--sun'); c.beginPath(); c.arc(40, 34, 20, 0, 7); c.fill();
      const flow = (x1, y1, x2, y2, col, w) => {
        if (w < .5) return;
        D.arrow(c, x1, y1, x2, y2, col, w, 10 + w);
        const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / 40);
        c.fillStyle = '#fff';
        for (let i = 0; i < n; i++) { const t = ((ph * 60 / L) + i / n) % 1; c.globalAlpha = .7; c.beginPath(); c.arc(lerp(x1, x2, t), lerp(y1, y2, t), Math.max(1.5, w / 4), 0, 7); c.fill(); }
        c.globalAlpha = 1;
      };
      const k = 22; // ancho máximo de flecha
      const sx = W * .22;
      flow(sx - 40, 50, sx + 40, gy - 6, cssv('--sun'), k);
      flow(sx + 60, gy - 10, sx + 120, 30, '#f4d77a', k * S.alb);
      D.text(c, 'luz solar', sx - 40, gy * .5, { size: 12, weight: 600, align: 'right' });
      D.text(c, 'reflejada (albedo)', sx + 130, 46, { size: 11, color: cssv('--muted') });
      const ix = W * .62;
      flow(ix, gy - 6, ix, S.atm ? ay1 + 4 : 20, cssv('--hot'), k * .9);
      D.text(c, 'infrarrojo de la superficie', ix + 14, gy - 30, { size: 11, weight: 600, color: cssv('--hot') });
      if (S.atm) {
        flow(ix + 50, ay0, ix + 50, 20, cssv('--hot'), k * .9 * (1 - eps) + k * .45 * eps);
        flow(ix - 60, ay1, ix - 60, gy - 6, cssv('--hot'), k * .45 * eps * 1.4);
        D.text(c, 'reemitido hacia abajo', ix - 70, ay1 + 26, { size: 11, weight: 600, align: 'right', color: cssv('--hot') });
        D.text(c, 'al espacio', ix + 64, 40, { size: 11, color: cssv('--muted') });
      }
      ctx.reads([['Temperatura media de la superficie', fmt(Ts - 273.15, 1) + ' °C', tempColor(Ts - 273.15, -20, 35)], ['Sin efecto invernadero', fmt(Te - 273.15, 1) + ' °C', cssv('--cold')], ['Calentamiento por efecto invernadero', '+' + fmt(Ts - Te, 1) + ' °C', cssv('--hot')], ['Absorción infrarroja ε', fmt(eps, 3)]]);
    });
  }
});
