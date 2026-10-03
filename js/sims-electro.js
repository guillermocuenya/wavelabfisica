/* ===== Simuladores: Coulomb y campo eléctrico, circuitos e instalación domiciliaria, electroimán ===== */
const KC = 8.99e9;

/* ---------- 14. Ley de Coulomb y campo eléctrico ---------- */
defSim({
  id: 'coulomb', icon: '⚡', title: 'Ley de Coulomb y campo eléctrico',
  short: 'Cargas que se atraen y se repelen; vectores de campo',
  desc: 'Las cargas del mismo signo se repelen y las de signo contrario se atraen. La fuerza crece con las cargas y disminuye con el cuadrado de la distancia. Arrastrá las cargas y observá la fuerza y el campo eléctrico a su alrededor.',
  formulas: [['F = k · |q₁ · q₂| / r²', 'k = 8,99 × 10⁹ N·m²/C²'], ['E = k · q / r²', 'campo eléctrico de una carga puntual (N/C)'], ['U = k · q₁ · q₂ / r', 'energía potencial eléctrica (J)'], ['1 µC = 10⁻⁶ C', '']],
  think: ['Si duplicás la distancia, ¿qué pasa con la fuerza?', '¿Hacia dónde apuntan los vectores de campo cerca de una carga positiva? ¿Y de una negativa?', '¿Qué significa que la energía potencial sea negativa?', '¿Por qué un peine frotado atrae papelitos?'],
  mount(ctx) {
    heading(ctx.panel, 'Cargas');
    const S = controls(ctx.panel, [
      { k: 'q1', label: 'Carga q₁', min: -10, max: 10, step: .5, val: 5, unit: 'µC', d: 1 },
      { k: 'q2', label: 'Carga q₂', min: -10, max: 10, step: .5, val: -3, unit: 'µC', d: 1 },
      { k: 'field', label: 'Mostrar campo eléctrico', type: 'check', val: true }
    ], () => draw());
    html(ctx.panel, 'Arrastrá las cargas con el mouse o el dedo. El ancho del área equivale a 1 metro.', 'muted');
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .85 : .55, () => draw());
    const Q = [{ x: .3, y: .5 }, { x: .7, y: .5 }]; let drag = -1;
    pointer(cv, p => { const m = 1 / cv.w; Q.forEach((q, i) => { if (Math.hypot(q.x * cv.w - p.x, q.y * cv.h - p.y) < 30) drag = i; }); },
      (p, down) => { if (down && drag >= 0) { Q[drag].x = clamp(p.x / cv.w, .03, .97); Q[drag].y = clamp(p.y / cv.h, .05, .95); draw(); } }, () => drag = -1);
    function draw() {
      if (!S) return;
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const m = 1 / W; // metros por px
      const qs = [S.q1 * 1e-6, S.q2 * 1e-6], P = Q.map(q => ({ x: q.x * W, y: q.y * H }));
      if (S.field) {
        const step = W < 600 ? 34 : 40;
        for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) {
          let ex = 0, ey = 0, near = false;
          P.forEach((p, i) => { const dx = (x - p.x) * m, dy = (y - p.y) * m, r2 = dx * dx + dy * dy, r = Math.sqrt(r2); if (r < .04) near = true; const E = KC * qs[i] / r2; ex += E * dx / r; ey += E * dy / r; });
          if (near) continue;
          const E = Math.hypot(ex, ey); if (E < 1) continue;
          const a = clamp((Math.log10(E) - 3) / 4, .08, 1), L = step * .38;
          c.globalAlpha = a; D.arrow(c, x - ex / E * L / 2, y - ey / E * L / 2, x + ex / E * L / 2, y + ey / E * L / 2, cssv('--muted'), 1.5, 6); c.globalAlpha = 1;
        }
      }
      const dx = (P[1].x - P[0].x) * m, dy = (P[1].y - P[0].y) * m, r = Math.hypot(dx, dy);
      const F = KC * qs[0] * qs[1] / (r * r); // >0 repulsión
      const len = clamp(20 + Math.log10(Math.abs(F) + 1e-9) * 25, 12, 120);
      if (qs[0] && qs[1]) {
        const ux = dx / r, uy = dy / r, s = F > 0 ? 1 : -1;
        D.arrow(c, P[0].x, P[0].y, P[0].x - s * ux * (len + 22), P[0].y - s * uy * (len + 22), cssv('--ec'), 3.5, 12);
        D.arrow(c, P[1].x, P[1].y, P[1].x + s * ux * (len + 22), P[1].y + s * uy * (len + 22), cssv('--ec'), 3.5, 12);
      }
      P.forEach((p, i) => {
        const q = qs[i]; c.fillStyle = q > 0 ? cssv('--pos') : q < 0 ? cssv('--neg') : cssv('--muted');
        c.beginPath(); c.arc(p.x, p.y, 20, 0, 7); c.fill();
        D.text(c, q > 0 ? '+' : q < 0 ? '−' : '0', p.x, p.y + 1, { align: 'center', size: 22, weight: 700, color: '#fff' });
        D.text(c, 'q' + (i + 1) + ' = ' + fmt(q * 1e6, 1) + ' µC', p.x, p.y + 34, { align: 'center', size: 12, weight: 700 });
      });
      ctx.reads([['Distancia', fu(r * 100, 'cm', 1)], ['Fuerza entre las cargas', fu(Math.abs(F), 'N', 3), cssv('--ec')], ['Tipo de interacción', !qs[0] || !qs[1] ? 'ninguna' : F > 0 ? 'repulsión' : 'atracción'], ['Energía potencial eléctrica', fu(KC * qs[0] * qs[1] / r, 'J', 3), cssv('--ep')]]);
    }
    draw();
  }
});

/* ---------- 15. Circuitos eléctricos ---------- */
defSim({
  id: 'circuito', icon: '💡', title: 'Circuitos eléctricos y ley de Ohm',
  short: 'Serie y paralelo, amperímetro, voltímetro, potencia y efecto Joule',
  desc: 'La fuerza electromotriz de la pila impulsa a los electrones por el circuito. La corriente depende del voltaje y de la resistencia. Las lámparas transforman energía eléctrica en luz y calor (efecto Joule). Probá conectarlas en serie y en paralelo.',
  formulas: [['V = I · R', 'ley de Ohm (V: volt, I: ampere, R: ohm)'], ['Serie: R = R₁ + R₂ · Paralelo: 1/R = 1/R₁ + 1/R₂', 'resistencia equivalente'], ['P = V · I = I² · R', 'potencia eléctrica (W)'], ['E = P · t', 'energía transformada en calor y luz (efecto Joule)']],
  think: ['En serie, si una lámpara se quema, ¿qué pasa con la otra? ¿Y en paralelo?', '¿En qué conexión brillan más las lámparas? ¿Por qué?', '¿Cómo se conecta un amperímetro? ¿Y un voltímetro?', '¿Por qué en las casas los artefactos se conectan en paralelo?'],
  tabs: [
    { id: 'ohm', label: '🔋 Circuito', mount: ohmMount },
    { id: 'casa', label: '🏠 Instalación de la casa', mount: casaMount }
  ]
});
function ohmMount(ctx) {
  heading(ctx.panel, 'Circuito');
  let ph = 0;
  const S = controls(ctx.panel, [
    { k: 'mode', label: 'Conexión', type: 'select', val: 's', options: [['s', 'En serie'], ['p', 'En paralelo']] },
    { k: 'V', label: 'Fuerza electromotriz de la fuente', min: 1.5, max: 24, step: .5, val: 12, unit: 'V', d: 1 },
    { k: 'R1', label: 'Resistencia lámpara 1', min: 1, max: 100, step: 1, val: 20, unit: 'Ω', d: 0 },
    { k: 'R2', label: 'Resistencia lámpara 2', min: 1, max: 100, step: 1, val: 40, unit: 'Ω', d: 0 },
    { k: 'b2', label: 'Lámpara 2 quemada (circuito abierto)', type: 'check', val: false }
  ]);
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .85 : .55, () => { });
  animate(cv, dt => {
    const ser = S.mode === 's', R2 = S.b2 ? Infinity : S.R2;
    let Req, I, I1, I2, V1, V2;
    if (ser) { Req = S.R1 + R2; I = S.V / Req; I1 = I2 = I; V1 = I * S.R1; V2 = isFinite(R2) ? I * R2 : S.V; }
    else { Req = 1 / (1 / S.R1 + 1 / R2); I = S.V / Req; V1 = V2 = S.V; I1 = S.V / S.R1; I2 = isFinite(R2) ? S.V / R2 : 0; }
    if (!isFinite(I)) I = 0;
    const P1 = I1 * I1 * S.R1, P2 = isFinite(R2) ? I2 * I2 * R2 : 0;
    ph += dt;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const L = W * .14, R = W * .86, T = H * .2, B = H * .82, mid = (L + R) / 2;
    c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.lineJoin = 'round';
    // fuente
    c.beginPath(); c.moveTo(L, T); c.lineTo(L, H / 2 - 16); c.moveTo(L, H / 2 + 16); c.lineTo(L, B); c.stroke();
    c.lineWidth = 4; c.beginPath(); c.moveTo(L - 22, H / 2 - 8); c.lineTo(L + 22, H / 2 - 8); c.stroke(); c.lineWidth = 2.5; c.beginPath(); c.moveTo(L - 12, H / 2 + 8); c.lineTo(L + 12, H / 2 + 8); c.stroke();
    D.text(c, fmt(S.V, 1) + ' V', L - 30, H / 2, { align: 'right', weight: 700 });
    D.text(c, '+', L + 28, H / 2 - 14, { weight: 700, color: cssv('--pos') });
    c.lineWidth = 3;
    const lamp = (x, y, P, label, broken) => {
      const glow = clamp(P / 8, 0, 1);
      if (glow > .02 && !broken) { const g = c.createRadialGradient(x, y, 4, x, y, 50); g.addColorStop(0, `rgba(255,214,90,${.85 * glow})`); g.addColorStop(1, 'rgba(255,214,90,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 50, 0, 7); c.fill(); }
      c.fillStyle = cssv('--card'); c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.arc(x, y, 16, 0, 7); c.fill(); c.stroke();
      c.lineWidth = 2; c.beginPath(); if (broken) { c.moveTo(x - 8, y - 8); c.lineTo(x - 2, y); c.moveTo(x + 8, y + 8); c.lineTo(x + 2, y); } else { c.moveTo(x - 11, y - 11); c.lineTo(x + 11, y + 11); c.moveTo(x - 11, y + 11); c.lineTo(x + 11, y - 11); } c.stroke();
      D.text(c, label, x, y - 28, { align: 'center', size: 12, weight: 700 });
    };
    const meter = (x, y, t, val) => { c.fillStyle = cssv('--card'); c.strokeStyle = cssv('--accent'); c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill(); c.stroke(); D.text(c, t, x, y + 1, { align: 'center', weight: 700, color: cssv('--accent') }); D.text(c, val, x, y + 28, { align: 'center', size: 12, weight: 700, color: cssv('--accent') }); };
    let paths;
    if (ser) {
      c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.moveTo(L, T); c.lineTo(R, T); c.lineTo(R, B); c.lineTo(L, B); c.stroke();
      lamp(L + (R - L) * .45, T, P1, 'R₁ = ' + S.R1 + ' Ω', false); lamp(L + (R - L) * .75, T, P2, 'R₂ = ' + (S.b2 ? '∞' : S.R2 + ' Ω'), S.b2);
      paths = [{ pts: [[L, B], [L, T], [R, T], [R, B], [L, B]], i: I }];
      // voltímetro sobre R1
      const x1 = L + (R - L) * .45; c.setLineDash([4, 4]); c.strokeStyle = cssv('--accent'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1 - 30, T); c.lineTo(x1 - 30, T + 50); c.lineTo(x1 - 16, T + 50); c.moveTo(x1 + 16, T + 50); c.lineTo(x1 + 30, T + 50); c.lineTo(x1 + 30, T); c.stroke(); c.setLineDash([]);
      meter(x1, T + 50, 'V', fmt(V1, 2) + ' V');
    } else {
      const xa = L + (R - L) * .5, xb = L + (R - L) * .8;
      c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.moveTo(L, T); c.lineTo(xb, T); c.lineTo(xb, B); c.lineTo(L, B); c.moveTo(xa, T); c.lineTo(xa, B); c.stroke();
      lamp(xa, H / 2, P1, 'R₁ = ' + S.R1 + ' Ω', false); lamp(xb, H / 2, P2, 'R₂ = ' + (S.b2 ? '∞' : S.R2 + ' Ω'), S.b2);
      paths = [{ pts: [[L, B], [L, T], [xa, T], [xa, B], [L, B]], i: I1 }, { pts: [[L, B], [L, T], [xb, T], [xb, B], [L, B]], i: I2 }];
      c.setLineDash([4, 4]); c.strokeStyle = cssv('--accent'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(xa, T + 20); c.lineTo(xa - 46, T + 20); c.lineTo(xa - 46, H / 2 - 15); c.moveTo(xa - 46, H / 2 + 15); c.lineTo(xa - 46, B - 20); c.lineTo(xa, B - 20); c.stroke(); c.setLineDash([]);
      meter(xa - 46, H / 2, 'V', fmt(V1, 2) + ' V');
    }
    meter(L + (R - L) * .2, T, 'A', fmt(I, 3) + ' A');
    // electrones (sentido convencional: del + al −)
    paths.forEach(p => {
      if (!p.i) return;
      const seg = []; let tot = 0; for (let k = 1; k < p.pts.length; k++) { const l = Math.hypot(p.pts[k][0] - p.pts[k - 1][0], p.pts[k][1] - p.pts[k - 1][1]); seg.push(l); tot += l; }
      const n = Math.floor(tot / 34), off = (ph * p.i * 160) % 34;
      c.fillStyle = cssv('--ec');
      for (let j = 0; j < n; j++) {
        let d = (j * 34 + off) % tot, k = 0; while (d > seg[k]) { d -= seg[k]; k++; }
        const a = p.pts[k], b = p.pts[k + 1], f = d / seg[k];
        c.beginPath(); c.arc(lerp(a[0], b[0], f), lerp(a[1], b[1], f), 3.5, 0, 7); c.fill();
      }
    });
    ctx.reads([['Resistencia equivalente', isFinite(Req) ? fu(Req, 'Ω', 2) : '∞'], ['Corriente total (amperímetro)', fu(I, 'A', 3), cssv('--accent')], ['Tensión en R₁ (voltímetro)', fu(V1, 'V', 2), cssv('--accent')], ['Potencia lámpara 1', fu(P1, 'W', 2), cssv('--sun')], ['Potencia lámpara 2', fu(P2, 'W', 2), cssv('--sun')], ['Energía en 1 hora', fu((P1 + P2), 'Wh', 2), cssv('--eq')]]);
  });
}
const HOME_APPS = [['Heladera', 150, true], ['Lámparas LED (8)', 72, true], ['Televisor', 100, true], ['Computadora', 150, false], ['Microondas', 1100, false], ['Pava eléctrica', 2000, false], ['Plancha', 1200, false], ['Secador de pelo', 1800, false], ['Aire acondicionado', 1300, false], ['Estufa eléctrica', 2000, false], ['Lavarropas (calentando)', 2000, false]];
function casaMount(ctx) {
  heading(ctx.panel, 'Circuito de tomacorrientes');
  const S = controls(ctx.panel, [{ k: 'br', label: 'Interruptor termomagnético', type: 'select', val: 16, options: [[10, '10 A (circuito de luces)'], [16, '16 A (tomacorrientes)'], [20, '20 A (tomas especiales)']] }], () => draw());
  html(ctx.panel, 'En Argentina la red domiciliaria es de 220 V y 50 Hz. Todos los artefactos se conectan en paralelo, así que sus corrientes se suman.', 'info');
  const st = HOME_APPS.map(a => a[2]);
  const list = html(ctx.stage, '');
  const cv = makeCanvas(ctx.stage, w => w < 600 ? .35 : .18, () => draw());
  list.innerHTML = `<div class="labs" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-bottom:12px">${HOME_APPS.map((a, i) => `<label class="lab" style="align-items:center;cursor:pointer"><input type="checkbox" data-i="${i}" ${a[2] ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--accent)"><span><strong>${a[0]}</strong><small>${a[1]} W · ${fmt(a[1] / 220, 2)} A</small></span></label>`).join('')}</div>`;
  $$('input', list).forEach(i => i.onchange = () => { st[+i.dataset.i] = i.checked; draw(); });
  function draw() {
    if (!S) return;
    const P = HOME_APPS.reduce((s, a, i) => s + (st[i] ? a[1] : 0), 0), I = P / 220, trip = I > S.br;
    const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
    const max = 30, bw = W - 40;
    c.fillStyle = cssv('--soft'); D.rrect(c, 20, H / 2 - 14, bw, 28, 14); c.fill();
    c.fillStyle = trip ? cssv('--bad') : I > S.br * .8 ? cssv('--ec') : cssv('--ok'); D.rrect(c, 20, H / 2 - 14, clamp(I / max, 0, 1) * bw, 28, 14); c.fill();
    const xb = 20 + S.br / max * bw; c.strokeStyle = cssv('--ink'); c.lineWidth = 3; c.beginPath(); c.moveTo(xb, H / 2 - 24); c.lineTo(xb, H / 2 + 24); c.stroke();
    D.text(c, 'límite ' + S.br + ' A', xb, H / 2 - 32, { align: 'center', size: 12, weight: 700 });
    D.text(c, fmt(I, 1) + ' A', 26, H / 2, { size: 13, weight: 700, color: '#fff' });
    ctx.reads([['Potencia total', fu(P, 'W', 0)], ['Corriente total', fu(I, 'A', 2), trip ? cssv('--bad') : cssv('--ok')], ['Estado', trip ? '⚠️ ¡Saltó la térmica!' : 'Funcionando'], ['Disyuntor diferencial', 'protege a las personas de descargas']]);
  }
  draw();
}

/* ---------- 16. Electroimán ---------- */
defSim({
  id: 'electroiman', icon: '🧲', title: 'Magnetismo y electroimán',
  short: 'Una corriente que circula por una bobina genera un campo magnético',
  desc: 'Toda corriente eléctrica genera un campo magnético. Si enrollamos el cable formando una bobina y le ponemos un núcleo de hierro, obtenemos un electroimán: un imán que se prende y se apaga. Se usa en timbres, relés, parlantes, motores y grúas.',
  formulas: [['B = μ₀ · μr · N · I / L', 'campo dentro de una bobina larga (tesla, T)'], ['μ₀ = 4π × 10⁻⁷ T·m/A', 'permeabilidad del vacío'], ['μr', 'permeabilidad relativa del núcleo (aire ≈ 1, hierro: cientos o miles)']],
  think: ['¿Qué tres cosas podés cambiar para que el electroimán sea más fuerte?', '¿Qué pasa con los polos si invertís el sentido de la corriente?', '¿Por qué una grúa de chatarrería usa un electroimán y no un imán común?', '¿Qué relación hay entre electricidad y magnetismo en un motor eléctrico?'],
  mount(ctx) {
    heading(ctx.panel, 'Bobina');
    const S = controls(ctx.panel, [
      { k: 'N', label: 'Número de vueltas N', min: 10, max: 500, step: 10, val: 200, d: 0 },
      { k: 'I', label: 'Corriente I', min: 0, max: 5, step: .1, val: 1.5, unit: 'A', d: 1 },
      { k: 'core', label: 'Núcleo', type: 'select', val: 200, options: [[1, 'Aire (μr ≈ 1)'], [200, 'Clavo de hierro (μr ≈ 200)'], [1000, 'Hierro dulce (μr ≈ 1000)']] },
      { k: 'inv', label: 'Invertir el sentido de la corriente', type: 'check', val: false }
    ], () => draw());
    const cv = makeCanvas(ctx.stage, w => w < 600 ? .8 : .5, () => draw());
    function draw() {
      if (!S) return;
      const Lb = .1, Braw = 4 * Math.PI * 1e-7 * S.core * S.N * S.I / Lb, B = Math.min(Braw, 1.6), sat = Braw > 1.6;
      const c = cv.ctx, W = cv.w, H = cv.h; D.clear(cv);
      const cx = W * .42, cy = H * .38, len = Math.min(W * .5, 320), ht = 40;
      // líneas de campo
      const nl = clamp(Math.round(Math.log10(B * 1e4 + 1) * 2.2), 0, 9);
      c.strokeStyle = cssv('--ep'); c.lineWidth = 1.4; c.globalAlpha = .6;
      for (let k = 1; k <= nl; k++) { c.beginPath(); c.ellipse(cx, cy, len / 2 + k * 12, ht / 2 + k * 14, 0, 0, 7); c.stroke(); }
      c.globalAlpha = 1;
      // núcleo y bobina
      c.fillStyle = S.core > 1 ? '#8b95a5' : cssv('--soft'); D.rrect(c, cx - len / 2, cy - ht / 2, len, ht, 6); c.fill();
      c.strokeStyle = '#c56a1c'; c.lineWidth = 3;
      const turns = clamp(Math.round(S.N / 20), 4, 25);
      for (let k = 0; k < turns; k++) { const x = cx - len / 2 + 10 + k * (len - 20) / (turns - 1 || 1); c.beginPath(); c.ellipse(x, cy, 5, ht / 2 + 6, 0, 0, 7); c.stroke(); }
      const nLeft = S.inv;
      D.text(c, nLeft ? 'N' : 'S', cx - len / 2 - 22, cy, { align: 'center', size: 20, weight: 700, color: nLeft ? cssv('--pos') : cssv('--neg'), font: 'Space Grotesk' });
      D.text(c, nLeft ? 'S' : 'N', cx + len / 2 + 22, cy, { align: 'center', size: 20, weight: 700, color: nLeft ? cssv('--neg') : cssv('--pos'), font: 'Space Grotesk' });
      // pila
      D.text(c, 'I = ' + fmt(S.I, 1) + ' A ' + (S.inv ? '←' : '→'), cx, cy - ht / 2 - 26, { align: 'center', weight: 700, color: '#c56a1c' });
      // clips atraídos
      const clips = clamp(Math.floor(B / .04), 0, 14);
      for (let k = 0; k < 14; k++) {
        const x = cx - len / 2 + 14 + k * (len - 28) / 13, attached = k < clips;
        const y = attached ? cy + ht / 2 + 6 : H - 26;
        c.strokeStyle = cssv('--muted'); c.lineWidth = 2; D.rrect(c, x - 4, y, 8, 18, 4); c.stroke();
      }
      // brújula
      const bx = W * .86, by = cy, ang = B > 1e-4 ? (S.inv ? Math.PI : 0) : -Math.PI / 2;
      c.strokeStyle = cssv('--edge'); c.lineWidth = 2; c.beginPath(); c.arc(bx, by, 26, 0, 7); c.stroke();
      c.save(); c.translate(bx, by); c.rotate(ang + Math.PI);
      c.fillStyle = cssv('--pos'); c.beginPath(); c.moveTo(22, 0); c.lineTo(0, 5); c.lineTo(0, -5); c.fill();
      c.fillStyle = cssv('--muted'); c.beginPath(); c.moveTo(-22, 0); c.lineTo(0, 5); c.lineTo(0, -5); c.fill(); c.restore();
      D.text(c, 'brújula', bx, by + 40, { align: 'center', size: 11, color: cssv('--muted') });
      ctx.reads([['Campo magnético B', B >= .01 ? fu(B, 'T', 3) : fu(B * 1000, 'mT', 2), cssv('--ep')], ['Comparado con el campo terrestre', '≈ ' + fmt(B / 5e-5, 0) + ' veces'], ['Clips que levanta', fmt(clips, 0)], ['Núcleo', sat ? 'saturado (no aumenta más)' : 'sin saturar']]);
    }
    draw();
  }
});
