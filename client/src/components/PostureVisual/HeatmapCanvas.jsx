import { useRef, useEffect, useCallback } from 'react';

const PALETTE = [
  { t: 0.0, r: 52, g: 211, b: 153 }, // #34d399 emerald
  { t: 0.5, r: 245, g: 158, b: 11 }, // #f59e0b amber
  { t: 1.0, r: 239, g: 68, b: 68 }, // #ef4444 red
];

const SMOOTHING_SCALE = 8;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

const mapToColor = (v) => {
  const p = PALETTE;
  if (v <= p[0].t) return `rgb(${p[0].r},${p[0].g},${p[0].b})`;
  if (v >= p[p.length - 1].t) return `rgb(${p[p.length - 1].r},${p[p.length - 1].g},${p[p.length - 1].b})`;
  
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
};

const subtractBaseline = (matrix, base) => {
  if (!matrix) return matrix;
  if (!base) return matrix;
  const r = matrix.length;
  const c = matrix[0].length;
  const out = new Array(r);
  for (let i = 0; i < r; i++) {
    out[i] = new Array(c);
    for (let j = 0; j < c; j++) {
      out[i][j] = Math.max(0, matrix[i][j] - (base[i]?.[j] || 0));
    }
  }
  return out;
};

const resampleMatrix = (m, tr, tc) => {
  const r = m.length;
  const c = m[0].length;
  const out = Array.from({ length: tr }, () => Array(tc).fill(0));
  for (let i = 0; i < tr; i++) {
    const y = (i * (r - 1)) / (tr - 1);
    const y0 = Math.floor(y);
    const y1 = Math.min(r - 1, y0 + 1);
    const fy = y - y0;
    for (let j = 0; j < tc; j++) {
      const x = (j * (c - 1)) / (tc - 1);
      const x0 = Math.floor(x);
      const x1 = Math.min(c - 1, x0 + 1);
      const fx = x - x0;
      const v00 = m[y0][x0];
      const v10 = m[y0][x1];
      const v01 = m[y1][x0];
      const v11 = m[y1][x1];
      const v0 = lerp(v00, v10, fx);
      const v1 = lerp(v01, v11, fx);
      out[i][j] = lerp(v0, v1, fy);
    }
  }
  return out;
};

const normalizeMatrix = (m, sensitivity) => {
  let min = Infinity;
  let max = -Infinity;
  for (const row of m) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const range = Math.max(1e-6, max - min);
  const gamma = lerp(2.2, 0.8, clamp01(sensitivity));
  return m.map((row) => row.map((v) => Math.pow(clamp01((v - min) / range), 1 / gamma)));
};

const HeatmapCanvas = ({ 
  matrix, 
  baseMatrix, 
  resolution = 8, 
  sensitivity = 0.6, 
  visible = true 
}) => {
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const containerRef = useRef(null);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix || !visible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply calibration baseline & normalization
    const calibrated = subtractBaseline(matrix, baseMatrix);
    const M = resolution && matrix.length !== resolution
      ? resampleMatrix(calibrated, resolution, resolution)
      : calibrated;
    const N = normalizeMatrix(M, sensitivity);

    // Prepare offscreen buffer
    const cell = SMOOTHING_SCALE;
    const offW = Math.max(2, (N[0]?.length || 1) * cell);
    const offH = Math.max(2, N.length * cell);

    let offscreen = offscreenRef.current;
    if (!offscreen || offscreen.width !== offW || offscreen.height !== offH) {
      offscreen = document.createElement('canvas');
      offscreen.width = offW;
      offscreen.height = offH;
      offscreenRef.current = offscreen;
    }

    const offCtx = offscreen.getContext('2d');
    offCtx.clearRect(0, 0, offW, offH);

    // Draw rectangles for each normalized value
    const rows = N.length;
    const cols = N[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        offCtx.fillStyle = mapToColor(N[i][j]);
        offCtx.fillRect(j * cell, i * cell, cell, cell);
      }
    }

    // Upscale to visible canvas with smoothing
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fit cover-style while preserving aspect ratio
    const cw = canvas.width;
    const ch = canvas.height;
    const arOff = offW / offH;
    const arCan = cw / ch;
    let dw = cw;
    let dh = ch;
    let dx = 0;
    let dy = 0;
    
    if (arOff > arCan) {
      dh = cw / arOff;
      dy = (ch - dh) / 2;
    } else {
      dw = ch * arOff;
      dx = (cw - dw) / 2;
    }
    
    ctx.drawImage(offscreen, dx, dy, dw, dh);
    ctx.restore();
  }, [matrix, baseMatrix, resolution, sensitivity, visible]);

  // Resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      drawHeatmap();
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawHeatmap]);

  // Redraw when data changes
  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900/60 border border-white/5">
      <canvas
        id="heatmapCanvas"
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${visible ? '' : 'opacity-0'}`}
      />
    </div>
  );
};

export default HeatmapCanvas;

