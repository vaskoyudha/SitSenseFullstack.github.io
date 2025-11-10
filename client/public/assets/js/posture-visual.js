/*
  SitSense — posture-visual.js
  -----------------------------
  Render heatmap (pressure matrix), silhouette overlay, balance bars, and posture score.
  - Public API (attached to window):
      initPostureVisual({ canvasId = 'heatmapCanvas' })
      updateHeatmap(matrix)                 // matrix: number[][] (rows x cols)
      updateBalance({ left, right, front, back })
      updateScore(score, label)
  - UI controls (optional, if present in DOM):
      #heatmapResolution  (select: 4/6/8/10)
      #heatmapSensitivity (range 0..100)
      #toggleHeatmap      (checkbox)
      #toggleSilhouette   (checkbox)
      #btnCalibrate       (button)
      #btnSnapshot        (button)
      #btnResetView       (button)
*/
(function () {
  const cfg = {
    canvasId: 'heatmapCanvas',
    silhouetteId: 'silhouette',
    // Color palette: low → mid → high (emerald → yellow → rose)
    palette: [
      { t: 0.0, r: 52,  g: 211, b: 153 },  // #34d399
      { t: 0.5, r: 245, g: 158, b: 11  },  // #f59e0b
      { t: 1.0, r: 239, g: 68,  b: 68  },  // #ef4444
    ],
    smoothingScale: 8,      // draw small to offscreen, scale up for smoothness
    defaultResolution: 8,   // target virtual grid if resample enabled via control
  };

  // State
  const state = {
    canvas: null, ctx: null,
    off: null, offCtx: null,   // offscreen buffer
    baseMatrix: null,          // calibration baseline
    lastMatrix: null,
    resolution: cfg.defaultResolution,
    sensitivity: 0.6,          // 0..1 → increases perceived intensity
    heatmapVisible: true,
    silhouetteVisible: true,
    needsRender: false,
  };

  // ---------- Utilities ----------
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function mapToColor(v) {
    // v in 0..1 -> RGB via 2-segment palette interpolation
    const p = cfg.palette;
    if (v <= p[0].t) return `rgb(${p[0].r},${p[0].g},${p[0].b})`;
    if (v >= p[p.length - 1].t) return `rgb(${p[p.length - 1].r},${p[p.length - 1].g},${p[p.length - 1].b})`;
    // find segment
    for (let i = 0; i < p.length - 1; i++) {
      if (v >= p[i].t && v <= p[i + 1].t) {
        const t = (v - p[i].t) / (p[i + 1].t - p[i].t);
        const r = Math.round(lerp(p[i].r, p[i + 1].r, t));
        const g = Math.round(lerp(p[i].g, p[i + 1].g, t));
        const b = Math.round(lerp(p[i].b, p[i + 1].b, t));
        return `rgb(${r},${g},${b})`;
      }
    }
    return `rgb(${p[0].r},${p[0].g},${p[0].b})`;
  }

  function resizeCanvasToContainer(canvas) {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.max(2, Math.floor(rect.width * dpr));
    canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    canvas.style.width = `${Math.floor(rect.width)}px`;
    canvas.style.height = `${Math.floor(rect.height)}px`;
    if (state.ctx) { state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    state.needsRender = true;
  }

  function makeOffscreen(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h; return c;
  }

  function subtractBaseline(matrix, base) {
    if (!matrix) return matrix;
    if (!base) return matrix;
    const r = matrix.length, c = matrix[0].length;
    const out = new Array(r);
    for (let i = 0; i < r; i++) {
      out[i] = new Array(c);
      for (let j = 0; j < c; j++) out[i][j] = Math.max(0, matrix[i][j] - (base[i]?.[j] || 0));
    }
    return out;
  }

  function resampleMatrix(m, tr, tc) {
    // Bilinear resample matrix m (r x c) to tr x tc
    const r = m.length, c = m[0].length;
    const out = Array.from({ length: tr }, () => Array(tc).fill(0));
    for (let i = 0; i < tr; i++) {
      const y = (i * (r - 1)) / (tr - 1);
      const y0 = Math.floor(y), y1 = Math.min(r - 1, y0 + 1);
      const fy = y - y0;
      for (let j = 0; j < tc; j++) {
        const x = (j * (c - 1)) / (tc - 1);
        const x0 = Math.floor(x), x1 = Math.min(c - 1, x0 + 1);
        const fx = x - x0;
        const v00 = m[y0][x0], v10 = m[y0][x1], v01 = m[y1][x0], v11 = m[y1][x1];
        const v0 = lerp(v00, v10, fx);
        const v1 = lerp(v01, v11, fx);
        out[i][j] = lerp(v0, v1, fy);
      }
    }
    return out;
  }

  function normalizeMatrix(m, sensitivity) {
    // Normalize to 0..1 with sensitivity curve (gamma-like)
    let min = Infinity, max = -Infinity;
    for (const row of m) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
    const range = Math.max(1e-6, max - min);
    const gamma = lerp(2.2, 0.8, clamp01(sensitivity)); // high sensitivity -> brighter
    return m.map(row => row.map(v => Math.pow(clamp01((v - min) / range), 1 / gamma)));
  }

  // ---------- Rendering ----------
  function drawHeatmap(matrix) {
    if (!state.canvas || !state.ctx || !matrix) return;

    // Apply calibration baseline & normalization
    const calibrated = subtractBaseline(matrix, state.baseMatrix);
    const M = state.resolution && matrix.length !== state.resolution
      ? resampleMatrix(calibrated, state.resolution, state.resolution)
      : calibrated;
    const N = normalizeMatrix(M, state.sensitivity);

    // Prepare offscreen size based on virtual grid
    const cell = cfg.smoothingScale; // pixels per virtual cell in offscreen
    const offW = Math.max(2, (N[0]?.length || 1) * cell);
    const offH = Math.max(2, N.length * cell);
    if (!state.off || state.off.width !== offW || state.off.height !== offH) {
      state.off = makeOffscreen(offW, offH);
      state.offCtx = state.off.getContext('2d');
    }

    const oc = state.offCtx;
    oc.clearRect(0, 0, offW, offH);

    // Draw rectangles for each normalized value
    const rows = N.length, cols = N[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        oc.fillStyle = mapToColor(N[i][j]);
        oc.fillRect(j * cell, i * cell, cell, cell);
      }
    }

    // Upscale to visible canvas with smoothing
    const ctx = state.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    // Fit cover-style while preserving aspect ratio of offscreen
    const cw = state.canvas.width, ch = state.canvas.height;
    const arOff = offW / offH, arCan = cw / ch;
    let dw = cw, dh = ch, dx = 0, dy = 0;
    if (arOff > arCan) { // offscreen wider than canvas
      dh = cw / arOff; dy = (ch - dh) / 2;
    } else { // taller
      dw = ch * arOff; dx = (cw - dw) / 2;
    }
    ctx.drawImage(state.off, dx, dy, dw, dh);
    ctx.restore();
  }

  // ---------- Balance & Score UI ----------
  function setBalance({ left, right, front, back }) {
    // left/right are expected 0..1 proportions of total
    const l = clamp01(left || 0), r = clamp01(right || 0);
    const f = clamp01(front || 0), b = clamp01(back || 0);

    const lrBias = Math.abs(l - r); // 0 (perfect) .. 1
    const fbBias = Math.abs(f - b);

    const lrPct = Math.round((r / (l + r || 1)) * 100);
    const fbPct = Math.round((b / (f + b || 1)) * 100);

    const elLR = document.getElementById('balanceLRFill');
    const elFB = document.getElementById('balanceFBFill');
    const valLR = document.getElementById('balanceLRVal');
    const valFB = document.getElementById('balanceFBVal');

    if (elLR) elLR.style.width = `${lrPct}%`;
    if (elFB) elFB.style.width = `${fbPct}%`;
    if (valLR) valLR.textContent = `${lrPct}%`;
    if (valFB) valFB.textContent = `${fbPct}%`;

    // expose for other modules
    window.__imbalance = { lr: lrBias, fb: fbBias };
  }

  function setScore(score, label) {
    const s = Math.max(0, Math.min(100, Math.round(score)));
    const bar = document.getElementById('postureScoreBar');
    const txt = document.getElementById('postureScore');
    const lab = document.getElementById('postureLabel');
    if (bar) bar.value = s;
    if (txt) txt.textContent = s;
    if (lab) lab.textContent = label || (s >= 75 ? 'Baik' : s >= 50 ? 'Perlu Koreksi' : 'Buruk');
    window.__postureScore = s;
  }

  // Optional: derive balance from matrix when not provided externally
  function deriveBalanceFromMatrix(matrix) {
    if (!matrix) return;
    const rows = matrix.length, cols = matrix[0].length;
    let left = 0, right = 0, front = 0, back = 0, total = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = Math.max(0, matrix[i][j]);
        total += v;
        if (j < cols / 2) left += v; else right += v;
        if (i < rows / 2) front += v; else back += v;
      }
    }
    if (total <= 0) return setBalance({ left: .5, right: .5, front: .5, back: .5 });
    setBalance({ left: left / total, right: right / total, front: front / total, back: back / total });
  }

  // ---------- Controls ----------
  function hookControls() {
    const selRes = document.getElementById('heatmapResolution');
    const rngSen = document.getElementById('heatmapSensitivity');
    const chkHM  = document.getElementById('toggleHeatmap');
    const chkSil = document.getElementById('toggleSilhouette');
    const btnCal = document.getElementById('btnCalibrate');
    const btnSnap= document.getElementById('btnSnapshot');
    const btnReset= document.getElementById('btnResetView');
    const silhouette = document.getElementById(cfg.silhouetteId);

    if (selRes) selRes.addEventListener('change', () => {
      const v = parseInt(selRes.value, 10);
      if (Number.isFinite(v) && v >= 2 && v <= 64) { state.resolution = v; requestRender(); }
    });

    if (rngSen) rngSen.addEventListener('input', () => {
      state.sensitivity = clamp01(parseInt(rngSen.value, 10) / 100);
      requestRender();
    });

    if (chkHM) chkHM.addEventListener('change', () => {
      state.heatmapVisible = !!chkHM.checked;
      if (state.canvas) state.canvas.style.opacity = state.heatmapVisible ? '1' : '0';
    });

    if (chkSil && silhouette) chkSil.addEventListener('change', () => {
      state.silhouetteVisible = !!chkSil.checked;
      silhouette.style.opacity = state.silhouetteVisible ? '0.8' : '0';
    });

    if (btnCal) btnCal.addEventListener('click', () => {
      // Use current matrix as baseline
      if (state.lastMatrix) state.baseMatrix = JSON.parse(JSON.stringify(state.lastMatrix));
      requestRender();
    });

    if (btnSnap) btnSnap.addEventListener('click', () => {
      if (!state.canvas) return;
      try {
        const a = document.createElement('a');
        a.href = state.canvas.toDataURL('image/png');
        a.download = `sitsense-heatmap-${Date.now()}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch (_) {}
    });

    if (btnReset) btnReset.addEventListener('click', () => {
      state.baseMatrix = null;
      state.sensitivity = 0.6;
      state.resolution = cfg.defaultResolution;
      const rng = document.getElementById('heatmapSensitivity'); if (rng) rng.value = String(Math.round(state.sensitivity * 100));
      const sel = document.getElementById('heatmapResolution'); if (sel) sel.value = String(state.resolution);
      requestRender();
    });
  }

  // ---------- Render scheduler ----------
  function requestRender() {
    state.needsRender = true;
  }
  function rafLoop() {
    if (state.needsRender && state.lastMatrix) {
      state.needsRender = false;
      drawHeatmap(state.lastMatrix);
    }
    requestAnimationFrame(rafLoop);
  }

  // ---------- Public API ----------
  function initPostureVisual(options) {
    const opts = Object.assign({ canvasId: cfg.canvasId }, options || {});
    state.canvas = document.getElementById(opts.canvasId);
    if (!state.canvas) { console.warn('[SitSense] heatmap canvas not found:', opts.canvasId); return; }
    state.ctx = state.canvas.getContext('2d');

    // initial size & listeners
    resizeCanvasToContainer(state.canvas);
    window.addEventListener('resize', () => resizeCanvasToContainer(state.canvas));

    hookControls();
    rafLoop();
  }

  function updateHeatmap(matrix) {
    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) return;
    state.lastMatrix = matrix;
    deriveBalanceFromMatrix(matrix); // optional auto-balance derivation
    requestRender();
  }

  function updateBalance(bal) { setBalance(bal || {}); }
  function updateScore(score, label) { setScore(score, label); }

  // Expose
  window.initPostureVisual = initPostureVisual;
  window.updateHeatmap = updateHeatmap;
  window.updateBalance = updateBalance;
  window.updateScore = updateScore;
})();
