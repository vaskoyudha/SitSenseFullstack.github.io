/*
  SitSense — history.js
  ----------------------
  Mengambil data riwayat dari Firebase (atau DEMO), melakukan agregasi per jam/hari/minggu,
  menampilkan KPI, grafik, tabel sesi, pagination, dan export CSV.

  Asumsi struktur RTDB:
    /history/sessions/{id} : {
      startTs: number (ms),
      endTs: number (ms),
      avgPressure?: number,    // 0..100
      avgScore?: number,       // 0..100
      goodCount?: number,      // menit/detik kategori "Baik"
      badCount?: number,       // menit/detik kategori "Buruk"
      alerts?: number,         // jumlah peringatan dalam sesi
      note?: string
    }
  Catatan: Jika field tertentu tidak ada, script akan mencoba menghitung dari yang tersedia atau memberi default.
*/
(function(){
  // ---------------- Utils ----------------
  const $ = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

  const fmtTime = (ts)=>{
    const d = new Date(ts);
    const p = (n)=> String(n).padStart(2,'0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const fmtDate = (ts)=>{
    const d = new Date(ts); const p=(n)=> String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  };
  const fmtDur = (sec)=>{
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec/3600); sec%=3600; const m = Math.floor(sec/60); const s = sec%60;
    const pad = (n)=> String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  function toStartOfDay(ts){ const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime(); }
  function toStartOfWeek(ts){ const d=new Date(toStartOfDay(ts)); const day=(d.getDay()||7); d.setDate(d.getDate()-(day-1)); return d.getTime(); }
  function addDays(ts, n){ const d=new Date(ts); d.setDate(d.getDate()+n); return d.getTime(); }
  function clamp(val, a, b){ return Math.max(a, Math.min(b, val)); }

  // ---------------- State ----------------
  const STATE = {
    sessions: [],       // hasil query
    page: 1,
    pageSize: 10,
    charts: { pressure: null, quality: null },
  };

  // ---------------- Fetch data ----------------
  async function fetchSessions(range){
    // range: { from: ms, to: ms }
    const isDemo = /[?&]demo=1\b/.test(location.search) || !window.firebase;
    if (isDemo) return demoSessions(range);

    try{
      const db = firebase.database();
      const ref = db.ref('/history/sessions');
      const snap = await ref.orderByChild('startTs').startAt(range.from).endAt(range.to + 86400000 - 1).get();
      const val = snap.val() || {};
      const list = Object.keys(val).map(id => ({ id, ...val[id] }))
        .filter(x => Number.isFinite(x.startTs) && Number.isFinite(x.endTs))
        .sort((a,b)=> a.startTs - b.startTs);
      return list;
    } catch(e){ console.warn('[SitSense] history fetch error:', e); return []; }
  }

  function demoSessions(range){
    // Buat data dummy tersebar dalam rentang
    const out = [];
    const dayMs = 86400000; const hourMs = 3600000;
    const from = toStartOfDay(range.from), to = toStartOfDay(range.to);
    for (let t = from; t <= to; t += dayMs){
      const sessionsPerDay = 2 + Math.floor(Math.random()*2); // 2-3 sesi/hari
      for (let i=0;i<sessionsPerDay;i++){
        const start = t + (8+Math.random()*8)*hourMs; // antara 08:00 - 24:00
        const dur = (20 + Math.floor(Math.random()*80)) * 60; // 20-100 menit
        const end = start + dur*1000;
        const score = clamp(Math.round(70 + (Math.random()*30-15)), 30, 95);
        const pressure = clamp(Math.round(40 + (Math.random()*30-15)), 15, 95);
        const good = Math.round(dur * clamp((score/100), 0.2, 0.9));
        const bad = Math.max(0, dur - good - Math.round(Math.random()*10));
        const alerts = Math.round(dur/45) + (score<55?1:0);
        out.push({ id: `demo_${t}_${i}`, startTs: start, endTs: end, avgPressure: pressure, avgScore: score, goodCount: good, badCount: bad, alerts, note: (score<50? 'Perlu perbaikan duduk':'') });
      }
    }
    return out.sort((a,b)=> a.startTs - b.startTs);
  }

  // ---------------- Aggregation ----------------
  function aggregate(sessions, agg){
    // Return { labels:[], pressureVals:[], qualityCounts:{good,fix,bad}, kpi:{...} }
    const buckets = new Map();
    const quality = { good:0, fix:0, bad:0 };

    let totalDur=0, totalSess=0, totalAlerts=0, totalGood=0, totalBad=0;

    for (const s of sessions){
      const durSec = Math.max(0, Math.floor((s.endTs - s.startTs)/1000));
      totalDur += durSec; totalSess++; totalAlerts += (s.alerts||0);
      totalGood += (s.goodCount||0); totalBad += (s.badCount||0);

      // bucket key
      let key;
      if (agg === 'hour') key = toStartOfDay(s.startTs) + Math.floor(new Date(s.startTs).getHours());
      else if (agg === 'week') key = toStartOfWeek(s.startTs);
      else key = toStartOfDay(s.startTs); // day

      if (!buckets.has(key)) buckets.set(key, { n:0, pressureSum:0, scoreSum:0 });
      const b = buckets.get(key);
      b.n++;
      b.pressureSum += Number.isFinite(s.avgPressure) ? s.avgPressure : 0;
      b.scoreSum += Number.isFinite(s.avgScore) ? s.avgScore : 0;

      // quality from avgScore
      const sc = Number.isFinite(s.avgScore) ? s.avgScore : 60;
      if (sc >= 75) quality.good++; else if (sc >= 50) quality.fix++; else quality.bad++;
    }

    const labels = []; const pressureVals = [];
    const keys = Array.from(buckets.keys()).sort((a,b)=> a-b);
    for (const k of keys){
      const b = buckets.get(k);
      const avgP = b.n ? (b.pressureSum/b.n) : 0;
      pressureVals.push(Math.round(avgP));
      labels.push(formatBucketLabel(k, agg));
    }

    const kpi = {
      totalDurationSec: totalDur,
      sessions: totalSess,
      avgSessionSec: totalSess? Math.round(totalDur/totalSess) : 0,
      goodPct: (totalGood+totalBad>0) ? Math.round((totalGood/(totalGood+totalBad))*100) : clamp(Math.round((quality.good/(totalSess||1))*100),0,100),
      alerts: totalAlerts,
    };

    return { labels, pressureVals, qualityCounts: quality, kpi };
  }

  function formatBucketLabel(key, agg){
    if (agg==='hour'){
      const day = Math.floor(key);
      const hour = Math.round((key - day));
      const d = new Date(day);
      const p=(n)=> String(n).padStart(2,'0');
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(hour)}:00`;
    }
    if (agg==='week'){
      const d = new Date(key);
      const p=(n)=> String(n).padStart(2,'0');
      const end = addDays(key, 6);
      const de = new Date(end);
      return `${p(d.getDate())}/${p(d.getMonth()+1)}–${p(de.getDate())}/${p(de.getMonth()+1)}`;
    }
    const d = new Date(key);
    const p=(n)=> String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }

  // ---------------- Charts ----------------
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function theme(){
    const accent = cssVar('--color-accent') || '#5cc8ff';
    const gridRGB = cssVar('--chart-grid-rgb') || '255,255,255';
    const gridA = parseFloat(cssVar('--chart-grid-alpha') || '.08');
    const tickRGB = cssVar('--chart-tick-rgb') || '231,238,252';
    const tickA = parseFloat(cssVar('--chart-tick-alpha') || '.65');
    return { accent, grid:`rgba(${gridRGB},${isNaN(gridA)?0.08:gridA})`, tick:`rgba(${tickRGB},${isNaN(tickA)?0.65:tickA})`, good:'#10b981', warn:'#f59e0b', bad:'#ef4444' };
  }
  function initCharts(){
    const t = theme();
    const hp = $('#historyPressure'); const hq = $('#historyQuality');
    if (!hp || !hq || !window.Chart) return;
    const ctxP = hp.getContext('2d');
    STATE.charts.pressure = new Chart(ctxP, {
      type: 'line', data: { labels: [], datasets: [{ label: 'Tekanan rata-rata', data: [], borderColor: t.accent, backgroundColor: 'transparent', tension: 0.25, pointRadius: 2, borderWidth: 2 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{mode:'index', intersect:false} }, scales:{ x:{ grid:{ color:t.grid }, ticks:{ color:t.tick } }, y:{ beginAtZero:true, grid:{ color:t.grid }, ticks:{ color:t.tick } } } }
    });
    const ctxQ = hq.getContext('2d');
    STATE.charts.quality = new Chart(ctxQ, {
      type: 'doughnut', data: { labels:['Baik','Perlu Koreksi','Buruk'], datasets:[{ data:[0,0,0], backgroundColor:[t.good,t.warn,t.bad], borderColor:'transparent' }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{ color:t.tick, boxWidth:10 } } } }
    });
  }
  function updateCharts(aggData){
    if (!STATE.charts.pressure || !STATE.charts.quality) return;
    const t = theme();
    const chP = STATE.charts.pressure; chP.data.labels = aggData.labels; chP.data.datasets[0].data = aggData.pressureVals; chP.options.scales.x.grid.color = t.grid; chP.options.scales.y.grid.color = t.grid; chP.options.scales.x.ticks.color = t.tick; chP.options.scales.y.ticks.color = t.tick; chP.update('none');
    const chQ = STATE.charts.quality; chQ.data.datasets[0].data = [aggData.qualityCounts.good, aggData.qualityCounts.fix, aggData.qualityCounts.bad]; chQ.data.datasets[0].backgroundColor = [t.good,t.warn,t.bad]; chQ.options.plugins.legend.labels.color = t.tick; chQ.update('none');
  }
  // Theme observer
  const mo = new MutationObserver(()=>{ if (STATE._lastAgg) updateCharts(STATE._lastAgg); });
  mo.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });

  // ---------------- KPI & Table ----------------
  function updateKPI(kpi){
    $('#kpiTotalDuration') && ($('#kpiTotalDuration').textContent = fmtDur(kpi.totalDurationSec));
    $('#kpiSessions') && ($('#kpiSessions').textContent = kpi.sessions);
    $('#kpiAvgSession') && ($('#kpiAvgSession').textContent = fmtDur(kpi.avgSessionSec));
    $('#kpiGoodPct') && ($('#kpiGoodPct').textContent = `${kpi.goodPct}%`);
    $('#kpiAlerts') && ($('#kpiAlerts').textContent = kpi.alerts);
  }

  function renderTable(sessions){
    const body = $('#historyTableBody'); if (!body) return;
    if (!sessions.length){ body.innerHTML = `<tr><td colspan="9" class="text-center text-slate-400">Tidak ada data</td></tr>`; $('#historySummary').textContent = 'Menampilkan 0 sesi'; return; }

    const start = (STATE.page-1)*STATE.pageSize;
    const pageItems = sessions.slice(start, start+STATE.pageSize);

    body.innerHTML = pageItems.map(s=>{
      const durSec = Math.max(0, Math.floor((s.endTs - s.startTs)/1000));
      const dateStr = fmtDate(s.startTs);
      const note = s.note ? s.note.replace(/[<>]/g,'') : '';
      const safeScore = Number.isFinite(s.avgScore) ? s.avgScore : '-';
      const safeGood = Number.isFinite(s.goodCount) ? s.goodCount : 0;
      const safeBad  = Number.isFinite(s.badCount) ? s.badCount  : 0;
      return `<tr class="hover">
        <td>${dateStr}</td>
        <td>${fmtTime(s.startTs)}</td>
        <td>${fmtTime(s.endTs)}</td>
        <td>${fmtDur(durSec)}</td>
        <td>${safeScore}</td>
        <td>${safeGood}</td>
        <td>${safeBad}</td>
        <td>${s.alerts||0}</td>
        <td>${note}</td>
      </tr>`;
    }).join('');

    const total = sessions.length;
    const end = Math.min(start + STATE.pageSize, total);
    $('#historySummary').textContent = `Menampilkan ${start+1}–${end} dari ${total} sesi`;

    // Pagination buttons
    $('#prevPage').disabled = (STATE.page<=1);
    $('#nextPage').disabled = (end>=total);
  }

  // ---------------- Export CSV ----------------
  function exportCSV(sessions){
    const header = ['Tanggal','Mulai','Selesai','Durasi','SkorRata','Baik','Buruk','Peringatan','Catatan'];
    const rows = sessions.map(s=>{
      const durSec = Math.max(0, Math.floor((s.endTs - s.startTs)/1000));
      return [
        fmtDate(s.startTs), fmtTime(s.startTs), fmtTime(s.endTs), fmtDur(durSec),
        Number.isFinite(s.avgScore)?s.avgScore:'', s.goodCount||0, s.badCount||0, s.alerts||0,
        (s.note||'').replace(/\n/g,' ').replace(/"/g,'""')
      ];
    });
    const csv = [header].concat(rows).map(r=> r.map(x=>`"${String(x)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`sitsense-history-${Date.now()}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // ---------------- Controller ----------------
  async function applyFilters(){
    if (window.NProgress) NProgress.start();
    try{
      const fd = $('#fromDate').value; const td = $('#toDate').value; const agg = $('#agg').value || 'day';
      if (!fd || !td){ window.SitSenseUI?.showToast?.('Pilih tanggal terlebih dahulu','warn'); return; }
      const from = new Date(fd+'T00:00:00').getTime();
      const to = new Date(td+'T23:59:59').getTime();
      const sessions = await fetchSessions({ from, to });
      STATE.sessions = sessions;
      STATE.page = 1;
      const aggData = aggregate(sessions, agg); STATE._lastAgg = aggData;
      updateKPI(aggData.kpi);
      initCharts();
      updateCharts(aggData);
      renderTable(STATE.sessions);
    } finally { if (window.NProgress) NProgress.done(); }
  }

  function wire(){
    $('#btnFetchHistory')?.addEventListener('click', applyFilters);
    $('#prevPage')?.addEventListener('click', ()=>{ if (STATE.page>1){ STATE.page--; renderTable(STATE.sessions); } });
    $('#nextPage')?.addEventListener('click', ()=>{ const maxPage=Math.ceil(STATE.sessions.length/STATE.pageSize); if (STATE.page<maxPage){ STATE.page++; renderTable(STATE.sessions); } });
    $('#btnExportCSV')?.addEventListener('click', ()=> exportCSV(STATE.sessions));
  }

  // ---------------- Boot ----------------
  document.addEventListener('DOMContentLoaded', ()=>{
    try { wire(); } catch(_) {}
    try { applyFilters(); } catch(_) {}
  });
})();
