/*
  SitSense — modal-detail.js
  --------------------------
  Hook ringan untuk components/modal-detail.html
  Fitur:
    • Buka/tutup modal detail sensor
    • Isi konten dari objek data
    • Snapshot heatmap dari #heatmapCanvas → #heatmapPreview
    • Export PNG & JSON (menyertakan matriks terakhir jika tersedia)
    • Trigger kalibrasi (klik #btnCalibrate jika ada)
    • Otomatis menyadap updateHeatmap / updateScore / updateBalance agar tersimpan ke window.__lastMatrix / __postureScore / __imbalance
    • Opsional: auto-wire tombol Details pada .sensor-card

  API global:
    SitSenseModal.open(data)
    SitSenseModal.close()
    SitSenseModal.renderPreview()
*/
(function(){
  const $ = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

  function fmtDur(sec){
    sec = Math.max(0, Math.floor(sec||0));
    const h = Math.floor(sec/3600); sec%=3600; const m=Math.floor(sec/60); const s=sec%60;
    const pad = n=> String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function getModal(){ return document.getElementById('sensorDetailModal'); }

  function setStatus(modal, status){
    const st = (status||'').toLowerCase();
    modal.removeAttribute('data-status');
    if (['good','warn','bad','offline'].includes(st)) modal.setAttribute('data-status', st);
    const el = modal.querySelector('[data-role=statusText]');
    if (el){
      el.textContent = st==='good' ? 'Baik' : st==='warn' ? 'Perlu Koreksi' : st==='bad' ? 'Buruk' : st==='offline' ? 'Offline' : '—';
    }
  }

  function fill(modal, data={}){
    if (!modal) return;
    modal.querySelector('[data-role=title]')?.replaceChildren(document.createTextNode(data.title || 'Tekanan Duduk'));
    modal.querySelector('[data-role=id]')?.replaceChildren(document.createTextNode(data.id || 'seat-1'));
    setStatus(modal, data.status || inferStatus(data));

    // Score block
    const score = Number.isFinite(data.score) ? Math.round(data.score) : (window.__postureScore ?? null);
    if (score!=null) modal.querySelector('[data-role=score]').textContent = String(score);
    modal.querySelector('[data-role=scoreLabel]').textContent = data.scoreLabel || inferScoreLabel(score);
    const bar = modal.querySelector('[data-role=scoreBar]'); if (bar) bar.value = Number.isFinite(score) ? score : 0;

    // Balance
    const lr = data.balance?.lr ?? (window.__imbalance?.lr ?? 0.5);
    const fb = data.balance?.fb ?? (window.__imbalance?.fb ?? 0.5);
    const lrPct = toPct(lr), fbPct = toPct(fb);
    modal.querySelector('[data-role=balanceLRFill]')?.setAttribute('style', `width:${lrPct}%`);
    modal.querySelector('[data-role=balanceFBFill]')?.setAttribute('style', `width:${fbPct}%`);
    modal.querySelector('[data-role=balanceLRVal]')?.replaceChildren(document.createTextNode(`${lrPct}%`));
    modal.querySelector('[data-role=balanceFBVal]')?.replaceChildren(document.createTextNode(`${fbPct}%`));

    // Meta
    if (data.avgPressure!=null) modal.querySelector('[data-role=avgPressure]').textContent = String(data.avgPressure);
    const durText = typeof data.duration === 'number' ? fmtDur(data.duration) : (data.duration || '—');
    modal.querySelector('[data-role=duration]').textContent = durText;
    modal.querySelector('[data-role=alerts]').textContent = String(data.alerts ?? (window.__alertsCount || 0));
    modal.querySelector('[data-role=resolution]').textContent = data.resolution || getResolutionHint();
    modal.querySelector('[data-role=notes]').textContent = (data.notes || '—');
    modal.querySelector('[data-role=updated]').textContent = data.updated ? new Date(data.updated).toLocaleTimeString() : new Date().toLocaleTimeString();
  }

  function toPct(v){
    if (v==null) return 50;
    // Jika input -1..1 → ubah ke 0..100 (asumsi |imbalance|)
    if (Math.abs(v) <= 1) return Math.round(Math.abs(v) * 100);
    // Jika input 0..100
    return Math.round(Math.max(0, Math.min(100, v)));
  }

  function inferStatus(data){
    const s = Number.isFinite(data?.score) ? data.score : (window.__postureScore ?? 70);
    if (s >= 75) return 'good'; if (s >= 50) return 'warn'; return 'bad';
  }
  function inferScoreLabel(score){
    if (score==null) return '—';
    return score>=75 ? 'Baik' : score>=50 ? 'Perlu Koreksi' : 'Buruk';
  }

  // ---- Heatmap preview ----
  function renderPreview(){
    const src = document.getElementById('heatmapCanvas');
    const dst = document.getElementById('heatmapPreview');
    if (!dst) return;
    const ctx = dst.getContext('2d');
    // ukur sesuai container
    const w = dst.clientWidth || 640; const h = dst.clientHeight || 480;
    dst.width = w; dst.height = h;
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,w,h);
    if (src && src.width && src.height){
      try { ctx.drawImage(src, 0, 0, w, h); } catch(_) {}
    }
  }

  // ---- Exporters ----
  function download(name, blob){
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPNG(){
    const c = document.getElementById('heatmapPreview'); if (!c) return;
    c.toBlob ? c.toBlob(b=> b && download(`sitsense-heatmap-${Date.now()}.png`, b)) : download(`sitsense-heatmap-${Date.now()}.png`, dataURLToBlob(c.toDataURL('image/png')));
  }
  function dataURLToBlob(dataURL){ const b = atob(dataURL.split(',')[1]); const arr = new Uint8Array(b.length); for (let i=0;i<b.length;i++) arr[i] = b.charCodeAt(i); return new Blob([arr], { type:'image/png' }); }

  function exportJSON(){
    const payload = {
      ts: Date.now(),
      id: $('#sensorDetailModal [data-role=id]')?.textContent || null,
      title: $('#sensorDetailModal [data-role=title]')?.textContent || null,
      score: Number($('#sensorDetailModal [data-role=score]')?.textContent || '') || null,
      scoreLabel: $('#sensorDetailModal [data-role=scoreLabel]')?.textContent || null,
      balance: window.__imbalance || null,
      avgPressure: $('#sensorDetailModal [data-role=avgPressure]')?.textContent || null,
      durationText: $('#sensorDetailModal [data-role=duration]')?.textContent || null,
      alerts: Number($('#sensorDetailModal [data-role=alerts]')?.textContent || '') || 0,
      resolution: $('#sensorDetailModal [data-role=resolution]')?.textContent || null,
      notes: $('#sensorDetailModal [data-role=notes]')?.textContent || null,
      matrix: window.__lastMatrix || null,
    };
    download(`sitsense-detail-${Date.now()}.json`, new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' }));
  }

  function calibrate(){
    const btn = document.getElementById('btnCalibrate');
    if (btn) btn.click();
  }

  // ---- Wrappers to capture latest data ----
  function wrapGlobals(){
    try {
      if (typeof window.updateHeatmap === 'function' && !window.updateHeatmap.__sitsenseWrapped){
        const orig = window.updateHeatmap;
        window.updateHeatmap = function(matrix){
          try { window.__lastMatrix = matrix; } catch(_) {}
          return orig.apply(this, arguments);
        };
        window.updateHeatmap.__sitsenseWrapped = true;
      }
    } catch(_) {}
    try {
      if (typeof window.updateScore === 'function' && !window.updateScore.__sitsenseWrapped){
        const orig = window.updateScore;
        window.updateScore = function(score, label){
          try { window.__postureScore = score; window.__postureLabel = label; } catch(_) {}
          return orig.apply(this, arguments);
        };
        window.updateScore.__sitsenseWrapped = true;
      }
    } catch(_) {}
    try {
      if (typeof window.updateBalance === 'function' && !window.updateBalance.__sitsenseWrapped){
        const orig = window.updateBalance;
        window.updateBalance = function(b){
          try { window.__imbalance = { lr: b?.left!=null&&b?.right!=null ? Math.abs((b.left||0)-(b.right||0)) : (b?.lr ?? 0), fb: b?.front!=null&&b?.back!=null ? Math.abs((b.front||0)-(b.back||0)) : (b?.fb ?? 0) }; } catch(_) {}
          return orig.apply(this, arguments);
        };
        window.updateBalance.__sitsenseWrapped = true;
      }
    } catch(_) {}
  }

  function getResolutionHint(){
    const sel = document.getElementById('heatmapResolution');
    if (sel && sel.value) return sel.value + ' sel';
    const m = window.__lastMatrix;
    if (Array.isArray(m) && Array.isArray(m[0])) return `${m.length}×${m[0].length}`;
    return '—';
  }

  // ---- Public API ----
  function open(data={}){
    const modal = getModal(); if (!modal) return;
    fill(modal, data);
    renderPreview();
    if (window.lucide) window.lucide.createIcons();
    try { modal.showModal(); } catch(_) { modal.setAttribute('open',''); }
  }
  function close(){ const m=getModal(); if (!m) return; try{ m.close(); }catch(_){ m.removeAttribute('open'); } }

  function wire(){
    wrapGlobals();

    // Hook buttons in modal
    const modal = getModal(); if (!modal) return;
    modal.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action]'); if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'exportPNG') exportPNG();
      else if (action === 'exportJSON') exportJSON();
      else if (action === 'calibrate') calibrate();
      else if (action === 'close') close();
    });

    // Auto-wire Details button on sensor cards
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action=details]'); if (!btn) return;
      const card = btn.closest('.sensor-card'); if (!card) return;
      const data = extractFromCard(card);
      open(data);
    });

    // Re-render preview on resize (to keep canvas crisp)
    const ro = new ResizeObserver(()=> renderPreview());
    const previewWrap = document.getElementById('heatmapPreview')?.parentElement;
    if (previewWrap) ro.observe(previewWrap);
  }

  function extractFromCard(card){
    const parseNum = (s)=>{ const n = parseFloat(String(s||'').replace(/[^\d\.\-]/g,'')); return Number.isFinite(n)?n:null; };
    const label = card.querySelector('[data-role=label]')?.textContent?.trim() || 'Sensor';
    const score = parseNum(card.querySelector('[data-role=value]')?.textContent);
    const alerts = parseNum(card.querySelector('[data-role=alerts]')?.textContent) || 0;
    const res = card.querySelector('[data-role=res]')?.textContent?.trim() || getResolutionHint();
    // status dari attribute
    const status = card.getAttribute('data-status') || inferStatus({ score });
    return {
      id: card.getAttribute('data-sensor-id') || 'seat-1',
      title: label,
      score,
      scoreLabel: inferScoreLabel(score),
      alerts,
      resolution: res,
      duration: (window.SitSenseAlerts?.getElapsedSeconds?.() || 0),
      avgPressure: (window.__lastMatrix ? Math.round(avgMatrix(window.__lastMatrix)) : null),
      updated: Date.now(),
      status,
    };
  }

  function avgMatrix(m){ let sum=0, n=0; for (const r of (m||[])){ for (const v of (r||[])){ sum+=Math.max(0, v||0); n++; } } return n? sum/n : 0; }

  // Auto init
  document.addEventListener('DOMContentLoaded', ()=>{ try { wire(); } catch(err){ console.warn('[SitSense] modal-detail init error', err); } });

  window.SitSenseModal = { open, close, renderPreview };
})();
