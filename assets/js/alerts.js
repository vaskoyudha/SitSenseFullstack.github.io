/*
  SitSense — alerts.js
  ---------------------
  Stop-watch durasi duduk + peringatan audio berbasis ambang (soft/hard),
  dengan API publik berikut (window.SitSenseAlerts):

    startSitTimer()                 // mulai hitung (jika belum jalan)
    stopSitTimer()                  // hentikan hitung (pause, simpan elapsed)
    resetSitTimer()                 // reset ke 0 dan hentikan
    setThresholds({ soft, hard, repeatSoftSec?, repeatHardSec? }) // detik
    getElapsedSeconds()             // integer detik
    onThresholdHit(cb)              // cb({ type:'soft'|'hard', elapsed })
    setMuted(flag)                  // matikan/nyalakan suara
    playAlert(type)                 // paksa mainkan 'soft' atau 'hard'

  UI yang disentuh (opsional bila ID ada):
    #sitDuration, #softThresholdLabel, #hardThresholdLabel
    <audio id="alertSoft">, <audio id="alertHard">

  Catatan autoplay: beberapa browser butuh user gesture.
  Jika play() gagal, sistem akan menunggu klik/touch berikutnya untuk memutar audio tertunda.
*/
(function(){
  const state = {
    running: false,
    startAt: 0,           // timestamp ms ketika start terakhir
    carry: 0,             // akumulasi durasi ms dari sesi sebelumnya
    tickId: null,
    thresholds: { soft: 30*60, hard: 60*60, repeatSoftSec: 15*60, repeatHardSec: 30*60 },
    lastSoftAt: null,     // detik ketika soft dipicu
    lastHardAt: null,     // detik ketika hard dipicu
    muted: false,
    pendingAudio: null,   // 'soft'|'hard' menunggu user gesture
  };

  const fmt = (s)=>{
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s/3600); s%=3600; const m=Math.floor(s/60); const sec=s%60;
    const pad = n=>String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  };

  function nowSec(){ return Math.floor(Date.now()/1000); }
  function elapsedSec(){
    if (!state.running) return Math.floor(state.carry/1000);
    return Math.floor((Date.now()-state.startAt + state.carry)/1000);
  }

  function updateClockUI(){
    const el = document.getElementById('sitDuration');
    if (el) el.textContent = fmt(elapsedSec());
  }

  function updateThresholdLabels(){
    const soft = document.getElementById('softThresholdLabel');
    const hard = document.getElementById('hardThresholdLabel');
    if (soft) soft.textContent = toHumanMin(state.thresholds.soft);
    if (hard) hard.textContent = toHumanMin(state.thresholds.hard);
  }
  function toHumanMin(sec){
    const m = Math.round(sec/60);
    return m >= 60 ? `${Math.floor(m/60)}j${String(m%60).padStart(2,'0')}m` : `${m}m`;
  }

  // ---------- Audio ----------
  function getAudioEl(type){
    return document.getElementById(type==='hard' ? 'alertHard' : 'alertSoft');
  }

  async function playAlert(type){
    if (state.muted) return;
    const el = getAudioEl(type);
    if (!el) return;
    try{
      el.currentTime = 0;
      await el.play();
    }catch(err){
      // Autoplay blocked → tunda sampai gesture
      state.pendingAudio = type;
      const once = ()=>{
        document.removeEventListener('click', once);
        document.removeEventListener('touchstart', once);
        const t = state.pendingAudio; state.pendingAudio = null;
        if (t) getAudioEl(t)?.play().catch(()=>{});
      };
      document.addEventListener('click', once, { once:true });
      document.addEventListener('touchstart', once, { once:true });
    }
    // Vibrate (jika ada)
    if (navigator.vibrate) navigator.vibrate(type==='hard' ? [60,40,60] : 40);
  }

  // ---------- Threshold logic ----------
  const listeners = new Set();
  function emit(type){
    const payload = { type, elapsed: elapsedSec() };
    listeners.forEach(fn=>{ try{ fn(payload); }catch(_){} });
    const ev = new CustomEvent('sitsense:alert', { detail: payload });
    document.dispatchEvent(ev);
  }

  function checkThresholds(){
    const e = elapsedSec();
    const { soft, hard, repeatSoftSec, repeatHardSec } = state.thresholds;

    // Hard threshold (prioritas tinggi)
    if (e >= hard){
      const shouldFire = state.lastHardAt === null || (e - state.lastHardAt) >= repeatHardSec;
      if (shouldFire){
        state.lastHardAt = e;
        playAlert('hard');
        emit('hard');
      }
      return; // jangan double trigger soft setelah hard di frame yang sama
    }

    // Soft threshold
    if (e >= soft){
      const shouldFire = state.lastSoftAt === null || (e - state.lastSoftAt) >= repeatSoftSec;
      if (shouldFire){
        state.lastSoftAt = e;
        playAlert('soft');
        emit('soft');
      }
    }
  }

  // ---------- Timer control ----------
  function tick(){
    updateClockUI();
    checkThresholds();
    const ev = new CustomEvent('sitsense:timer:tick', { detail: { elapsed: elapsedSec() } });
    document.dispatchEvent(ev);
  }

  function startSitTimer(){
    if (state.running) return;
    state.running = true;
    state.startAt = Date.now();
    if (state.tickId) clearInterval(state.tickId);
    state.tickId = setInterval(tick, 1000);
    document.dispatchEvent(new CustomEvent('sitsense:timer:start'));
  }

  function stopSitTimer(){
    if (!state.running) return;
    state.carry += Date.now() - state.startAt;
    state.running = false;
    state.startAt = 0;
    if (state.tickId) { clearInterval(state.tickId); state.tickId = null; }
    document.dispatchEvent(new CustomEvent('sitsense:timer:stop', { detail: { elapsed: elapsedSec() } }));
  }

  function resetSitTimer(){
    if (state.tickId) { clearInterval(state.tickId); state.tickId = null; }
    state.running = false; state.startAt = 0; state.carry = 0;
    state.lastSoftAt = null; state.lastHardAt = null;
    updateClockUI();
    document.dispatchEvent(new CustomEvent('sitsense:timer:reset'));
  }

  function setThresholds({ soft, hard, repeatSoftSec, repeatHardSec }){
    if (Number.isFinite(soft) && soft > 0) state.thresholds.soft = Math.floor(soft);
    if (Number.isFinite(hard) && hard > 0) state.thresholds.hard = Math.floor(hard);
    if (Number.isFinite(repeatSoftSec) && repeatSoftSec >= 10) state.thresholds.repeatSoftSec = Math.floor(repeatSoftSec);
    if (Number.isFinite(repeatHardSec) && repeatHardSec >= 10) state.thresholds.repeatHardSec = Math.floor(repeatHardSec);
    // Pastikan konsistensi: hard >= soft
    if (state.thresholds.hard < state.thresholds.soft) state.thresholds.hard = state.thresholds.soft;
    updateThresholdLabels();
  }

  function onThresholdHit(cb){ if (typeof cb === 'function') listeners.add(cb); return ()=>listeners.delete(cb); }
  function setMuted(flag){ state.muted = !!flag; }

  // Pause/resume behavior when tab hidden/visible → tetap akurat (pakai time delta)
  document.addEventListener('visibilitychange', ()=>{
    if (!state.running) return;
    if (document.hidden){
      // biarkan berjalan; tick berbasis setInterval mungkin throttled tapi elapsed menghitung delta waktu riil
      return;
    } else {
      // saat kembali, paksa update UI langsung
      tick();
    }
  });

  // Public API
  window.SitSenseAlerts = {
    startSitTimer,
    stopSitTimer,
    resetSitTimer,
    setThresholds,
    getElapsedSeconds: elapsedSec,
    onThresholdHit,
    setMuted,
    playAlert,
  };

  // Boot ringan saat DOM siap
  document.addEventListener('DOMContentLoaded', ()=>{
    updateClockUI();
    updateThresholdLabels();
  });
})();
