/*
  SitSense — charts.js
  ---------------------
  Dua grafik Chart.js:
    1) Tekanan vs Waktu (line area) — dataset nilai tekanan rata-rata tiap detik
    2) Kualitas Postur (doughnut) — agregasi Baik/Perlu Koreksi/Buruk

  API global:
    SitSenseCharts.pushPressure(value:number)
    SitSenseCharts.updateQuality(label:'Baik'|'Perlu Koreksi'|'Buruk')
    SitSenseCharts.setMaxPoints(n:number)
    SitSenseCharts.reset()
    SitSenseCharts.snapshot() -> { pressureDataUrl, qualityDataUrl }

  Catatan: Warna mengikuti CSS variables di theme.css
*/
(function(){
  const MAX_DEFAULT = 120; // 2 menit @1Hz
  const STATE = {
    maxPoints: MAX_DEFAULT,
    pressure: [],
    labels: [],
    counts: { good: 0, fix: 0, bad: 0 },
    charts: { pressure: null, quality: null },
  };

  // ---------- Utils ----------
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function hexToRGBA(hex, a=1){
    if (!hex) return `rgba(0,0,0,${a})`;
    const h = hex.replace('#','');
    const b = h.length===3 ? h.split('').map(x=>x+x).join('') : h;
    const r = parseInt(b.slice(0,2),16), g=parseInt(b.slice(2,4),16), bl=parseInt(b.slice(4,6),16);
    return `rgba(${r},${g},${bl},${a})`;
  }

  function theme(){
    const accent = cssVar('--color-accent') || '#5cc8ff';
    const accent2 = cssVar('--color-accent-2') || '#79f2c0';
    const gridRGB = cssVar('--chart-grid-rgb') || '255,255,255';
    const gridA = parseFloat(cssVar('--chart-grid-alpha') || '.08');
    const tickRGB = cssVar('--chart-tick-rgb') || '231,238,252';
    const tickA = parseFloat(cssVar('--chart-tick-alpha') || '.65');
    return {
      accent,
      accent2,
      grid: `rgba(${gridRGB}, ${isNaN(gridA)?0.08:gridA})`,
      tick: `rgba(${tickRGB}, ${isNaN(tickA)?0.65:tickA})`,
      good: '#10b981', // emerald-500
      warn: '#f59e0b', // amber-500
      bad:  '#ef4444', // red-500
    };
  }

  function makeLineGradient(ctx){
    const t = theme();
    const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, hexToRGBA(t.accent, 0.35));
    g.addColorStop(1, hexToRGBA(t.accent, 0.00));
    return g;
  }

  // ---------- Init Charts ----------
  function initPressureChart(){
    const c = document.getElementById('chartPressure');
    if (!c) return null;
    const t = theme();
    const ctx = c.getContext('2d');
    const gradient = makeLineGradient(ctx);

    const ch = new Chart(ctx, {
      type: 'line',
      data: {
        labels: STATE.labels,
        datasets: [{
          label: 'Tekanan rata-rata',
          data: STATE.pressure,
          borderColor: t.accent,
          backgroundColor: gradient,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            grid: { color: t.grid },
            ticks: { color: t.tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          },
          y: {
            grid: { color: t.grid },
            ticks: { color: t.tick },
            beginAtZero: true
          }
        }
      }
    });

    // Recompute gradient on resize (height changes)
    const ro = new ResizeObserver(()=>{
      ch.data.datasets[0].backgroundColor = makeLineGradient(ctx);
      ch.update('none');
    });
    ro.observe(c);

    return ch;
  }

  function initQualityChart(){
    const c = document.getElementById('chartQuality');
    if (!c) return null;
    const t = theme();
    const ctx = c.getContext('2d');

    const ch = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Baik', 'Perlu Koreksi', 'Buruk'],
        datasets: [{
          data: [STATE.counts.good, STATE.counts.fix, STATE.counts.bad],
          backgroundColor: [t.good, t.warn, t.bad],
          borderColor: 'transparent',
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: theme().tick, boxWidth: 10 }
          },
          tooltip: { callbacks: { label: (ctx)=> `${ctx.label}: ${ctx.raw}` } }
        }
      }
    });
    return ch;
  }

  function initCharts(){
    // Global defaults (match theme)
    Chart.defaults.font.family = 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif';
    const t = theme();
    Chart.defaults.color = t.tick;
    STATE.charts.pressure = initPressureChart();
    STATE.charts.quality = initQualityChart();
  }

  // ---------- Theme sync ----------
  function syncTheme(){
    const t = theme();
    if (STATE.charts.pressure){
      const ch = STATE.charts.pressure;
      ch.options.scales.x.grid.color = t.grid;
      ch.options.scales.y.grid.color = t.grid;
      ch.options.scales.x.ticks.color = t.tick;
      ch.options.scales.y.ticks.color = t.tick;
      ch.data.datasets[0].borderColor = t.accent;
      ch.data.datasets[0].backgroundColor = makeLineGradient(ch.ctx);
      ch.update('none');
    }
    if (STATE.charts.quality){
      const ch = STATE.charts.quality;
      ch.data.datasets[0].backgroundColor = [t.good, t.warn, t.bad];
      ch.options.plugins.legend.labels.color = t.tick;
      ch.update('none');
    }
  }

  // Observe data-theme changes
  const mo = new MutationObserver(()=> syncTheme());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---------- Public API ----------
  function pushPressure(val){
    if (!Number.isFinite(val)) return;
    STATE.pressure.push(val);
    const ts = new Date();
    const lab = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
    STATE.labels.push(lab);
    if (STATE.pressure.length > STATE.maxPoints){ STATE.pressure.shift(); STATE.labels.shift(); }
    if (STATE.charts.pressure){ STATE.charts.pressure.update('none'); }
  }

  function updateQuality(label){
    const l = (label||'').toLowerCase();
    if (l.includes('buruk')) STATE.counts.bad++;
    else if (l.includes('koreksi')) STATE.counts.fix++;
    else STATE.counts.good++;
    if (STATE.charts.quality){
      const ds = STATE.charts.quality.data.datasets[0];
      ds.data = [STATE.counts.good, STATE.counts.fix, STATE.counts.bad];
      STATE.charts.quality.update('none');
    }
  }

  function setMaxPoints(n){
    if (!Number.isFinite(n) || n < 10) return;
    STATE.maxPoints = Math.floor(n);
    while (STATE.pressure.length > STATE.maxPoints){ STATE.pressure.shift(); STATE.labels.shift(); }
    if (STATE.charts.pressure) STATE.charts.pressure.update('none');
  }

  function reset(){
    STATE.pressure.length = 0; STATE.labels.length = 0;
    STATE.counts = { good:0, fix:0, bad:0 };
    if (STATE.charts.pressure){ STATE.charts.pressure.data.labels = STATE.labels; STATE.charts.pressure.data.datasets[0].data = STATE.pressure; STATE.charts.pressure.update('none'); }
    if (STATE.charts.quality){ STATE.charts.quality.data.datasets[0].data = [0,0,0]; STATE.charts.quality.update('none'); }
  }

  function snapshot(){
    return {
      pressureDataUrl: STATE.charts.pressure ? STATE.charts.pressure.toBase64Image() : null,
      qualityDataUrl: STATE.charts.quality ? STATE.charts.quality.toBase64Image() : null,
    };
  }

  // Expose global
  window.SitSenseCharts = { pushPressure, updateQuality, setMaxPoints, reset, snapshot, syncTheme };

  // Boot
  document.addEventListener('DOMContentLoaded', ()=>{ try { initCharts(); } catch(_){} });
})();
