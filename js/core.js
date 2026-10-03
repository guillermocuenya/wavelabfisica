/* ===== WaveLab Física · núcleo: utilidades, canvas, controles, gráficos ===== */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const G = 9.8;
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const store = {
  get(k, d) { try { const v = localStorage.getItem('wavelab.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('wavelab.' + k, JSON.stringify(v)); } catch (e) { } }
};

/* números en formato argentino; notación científica para muy grandes o chicos */
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function fmt(x, d = 2) {
  if (x === null || x === undefined || !isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e7 || a < 1e-3)) {
    const e = Math.floor(Math.log10(a)); const m = x / Math.pow(10, e);
    return m.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' × 10' + String(e).split('').map(c => SUP[c]).join('');
  }
  return x.toLocaleString('es-AR', { maximumFractionDigits: d });
}
const fu = (x, u, d) => fmt(x, d) + (u ? ' ' + u : '');

/* color de temperatura: frío (azul) -> caliente (rojo) */
function tempColor(T, lo = 0, hi = 100) {
  const t = clamp((T - lo) / (hi - lo), 0, 1);
  const st = [[42, 111, 219], [124, 92, 196], [232, 128, 58], [214, 52, 42]]; // azul, violeta, naranja, rojo
  const k = Math.min(Math.floor(t * 3), 2), f = t * 3 - k, a = st[k], b = st[k + 1];
  return `rgb(${Math.round(lerp(a[0], b[0], f))},${Math.round(lerp(a[1], b[1], f))},${Math.round(lerp(a[2], b[2], f))})`;
}

/* ===== canvas responsivo ===== */
function makeCanvas(parent, ratio, draw) {
  const wrap = document.createElement('div'); wrap.className = 'cv-wrap';
  const cv = document.createElement('canvas'); wrap.appendChild(cv); parent.appendChild(wrap);
  const st = { cv, ctx: cv.getContext('2d'), w: 0, h: 0, draw };
  const r = typeof ratio === 'function' ? ratio : (() => ratio);
  st.resize = (noDraw) => {
    const w = Math.max(200, wrap.clientWidth); const h = Math.round(w * r(w));
    if (w === st.w && h === st.h && noDraw !== false && st.ready) { return; }
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px';
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); st.w = w; st.h = h;
    if (!noDraw) st.draw && st.draw(st);
  };
  // el primer dibujo lo hace el ResizeObserver (así la simulación termina de inicializarse antes)
  const ro = new ResizeObserver(() => { if (!cv.isConnected) { ro.disconnect(); return; } st.ready = true; st.resize(false); });
  ro.observe(wrap); st.resize(true);
  return st;
}
/* bucle de animación que se detiene solo al salir de la página */
function animate(st, step) {
  let last = performance.now();
  const f = t => {
    if (!st.cv.isConnected) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    step(dt); requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
/* posición del puntero en coordenadas del canvas */
function pointer(st, onDown, onMove, onUp) {
  const pos = e => { const r = st.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let down = false;
  st.cv.addEventListener('pointerdown', e => { down = true; st.cv.setPointerCapture(e.pointerId); onDown && onDown(pos(e)); });
  st.cv.addEventListener('pointermove', e => { onMove && onMove(pos(e), down); });
  st.cv.addEventListener('pointerup', e => { down = false; onUp && onUp(pos(e)); });
}

/* ===== dibujo ===== */
const D = {
  clear(st) { const c = st.ctx; c.clearRect(0, 0, st.w, st.h); },
  text(c, s, x, y, o = {}) {
    c.save(); c.fillStyle = o.color || cssv('--ink'); c.font = `${o.weight || 500} ${o.size || 13}px ${o.font || 'Inter, system-ui, sans-serif'}`;
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle'; c.fillText(s, x, y); c.restore();
  },
  arrow(c, x1, y1, x2, y2, color, w = 2.5, head = 9) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 1) return;
    const hh = Math.min(head, L * .6);
    c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - hh * .8 * Math.cos(a), y2 - hh * .8 * Math.sin(a)); c.stroke();
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - hh * Math.cos(a - .42), y2 - hh * Math.sin(a - .42)); c.lineTo(x2 - hh * Math.cos(a + .42), y2 - hh * Math.sin(a + .42)); c.closePath(); c.fill();
    c.restore();
  },
  rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); },
  /* barras verticales con etiqueta: items [{label, val, color}] */
  bars(c, x, y, w, h, items, max, unit = 'J') {
    const n = items.length, gap = 10, bw = (w - gap * (n - 1)) / n;
    max = max || Math.max(...items.map(i => Math.abs(i.val)), 1e-9);
    items.forEach((it, i) => {
      const bx = x + i * (bw + gap), bh = clamp(it.val / max, 0, 1.05) * (h - 34);
      c.fillStyle = cssv('--soft'); D.rrect(c, bx, y, bw, h - 34, 6); c.fill();
      c.fillStyle = it.color; D.rrect(c, bx, y + h - 34 - bh, bw, bh, 6); c.fill();
      D.text(c, it.label, bx + bw / 2, y + h - 22, { align: 'center', size: 11, weight: 600, color: cssv('--muted') });
      D.text(c, fmt(it.val, 0) + ' ' + unit, bx + bw / 2, y + h - 8, { align: 'center', size: 11, weight: 700 });
    });
  },
  /* gráfico de líneas: series [{pts:[[x,y]], color, label}] */
  plot(c, r, series, o = {}) {
    const { x0 = 0, x1 = 1, y0 = 0, y1 = 1 } = o;
    const X = v => r.x + (v - x0) / (x1 - x0 || 1) * r.w, Y = v => r.y + r.h - (v - y0) / (y1 - y0 || 1) * r.h;
    c.save();
    c.strokeStyle = cssv('--grid'); c.lineWidth = 1;
    const ny = o.ny || 4;
    for (let i = 0; i <= ny; i++) {
      const v = y0 + (y1 - y0) * i / ny, yy = Y(v);
      c.beginPath(); c.moveTo(r.x, yy); c.lineTo(r.x + r.w, yy); c.stroke();
      D.text(c, fmt(v, o.yd ?? 0), r.x - 6, yy, { align: 'right', size: 10, color: cssv('--muted') });
    }
    const nx = o.nx || 5;
    for (let i = 0; i <= nx; i++) {
      const v = x0 + (x1 - x0) * i / nx, xx = X(v);
      D.text(c, o.xfmt ? o.xfmt(v) : fmt(v, o.xd ?? 0), xx, r.y + r.h + 12, { align: 'center', size: 10, color: cssv('--muted') });
    }
    c.strokeStyle = cssv('--muted'); c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x, r.y + r.h); c.lineTo(r.x + r.w, r.y + r.h); c.stroke();
    if (o.xl) D.text(c, o.xl, r.x + r.w, r.y + r.h + 26, { align: 'right', size: 11, weight: 600, color: cssv('--muted') });
    if (o.yl) D.text(c, o.yl, r.x, r.y - 12, { align: 'left', size: 11, weight: 600, color: cssv('--muted') });
    c.beginPath(); c.rect(r.x, r.y - 2, r.w + 2, r.h + 4); c.clip();
    series.forEach(s => {
      if (!s.pts.length) return;
      c.strokeStyle = s.color; c.lineWidth = s.w || 2.5; c.lineJoin = 'round'; if (s.dash) c.setLineDash(s.dash); else c.setLineDash([]);
      c.beginPath(); s.pts.forEach(([a, b], i) => i ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b))); c.stroke();
    });
    c.restore();
    if (o.legend) {
      let lx = r.x + 8;
      series.filter(s => s.label).forEach(s => { c.fillStyle = s.color; c.fillRect(lx, r.y + 4, 12, 4); D.text(c, s.label, lx + 16, r.y + 6, { size: 11, weight: 600 }); lx += 26 + c.measureText(s.label).width * 1.1; });
    }
    return { X, Y };
  }
};

/* ===== controles ===== */
let ctlId = 0;
function controls(parent, defs, onChange) {
  const box = document.createElement('div'); box.className = 'ctrls'; parent.appendChild(box);
  const st = {}; const outs = {}; const inputs = {};
  defs.forEach(d => {
    const id = 'c' + (++ctlId);
    const row = document.createElement('div'); row.className = 'ctl' + (d.type === 'check' ? ' check' : '');
    st[d.k] = d.val;
    if (d.type === 'select') {
      row.innerHTML = `<label for="${id}">${d.label}</label><select id="${id}">${d.options.map(o => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`;
      const s = $('select', row); s.value = d.val;
      s.onchange = () => { st[d.k] = isNaN(+s.value) || s.value === '' ? s.value : +s.value; onChange && onChange(st, d.k); };
      inputs[d.k] = s;
    } else if (d.type === 'check') {
      row.innerHTML = `<label><input type="checkbox" id="${id}" ${d.val ? 'checked' : ''}> ${d.label}</label>`;
      const s = $('input', row); s.onchange = () => { st[d.k] = s.checked; onChange && onChange(st, d.k); };
      inputs[d.k] = s;
    } else if (d.type === 'number') {
      row.innerHTML = `<label for="${id}">${d.label}</label><input type="number" id="${id}" step="${d.step || 'any'}" value="${d.val}" ${d.min !== undefined ? `min="${d.min}"` : ''}>`;
      const s = $('input', row); s.oninput = () => { st[d.k] = s.value === '' ? NaN : +s.value; onChange && onChange(st, d.k); };
      inputs[d.k] = s;
    } else {
      row.innerHTML = `<label for="${id}"><span>${d.label}</span><output></output></label><input type="range" id="${id}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.val}">`;
      const s = $('input', row), o = $('output', row);
      const show = v => o.textContent = d.fmt ? d.fmt(v) : fu(v, d.unit, d.d ?? 2);
      show(d.val); outs[d.k] = show;
      s.oninput = () => { st[d.k] = +s.value; show(+s.value); onChange && onChange(st, d.k); };
      inputs[d.k] = s;
    }
    box.appendChild(row);
  });
  Object.defineProperty(st, 'set', {
    enumerable: false, value(obj, silent) {
      Object.entries(obj).forEach(([k, v]) => {
        st[k] = v; const i = inputs[k]; if (!i) return;
        if (i.type === 'checkbox') i.checked = v; else i.value = v;
        outs[k] && outs[k](v);
      });
      if (!silent) onChange && onChange(st, '*');
    }
  });
  return st;
}
function buttons(parent, list) {
  const r = document.createElement('div'); r.className = 'presets'; parent.appendChild(r);
  list.forEach(([label, fn, cls]) => { const b = document.createElement('button'); b.className = 'btn sm ' + (cls || ''); b.textContent = label; b.onclick = () => fn(b); r.appendChild(b); });
  return r;
}
function heading(parent, txt) { const h = document.createElement('h4'); h.textContent = txt; parent.appendChild(h); return h; }
function html(parent, s, cls) { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = s; parent.appendChild(d); return d; }

/* ===== registro de simuladores ===== */
const SIMS = {};
function defSim(s) { SIMS[s.id] = s; }
