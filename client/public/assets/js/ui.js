/*
  SitSense — ui.js (Integrasi ringan)
  -----------------------------------
  Peran:
    • Theme manager (dark/light) + toggle inject ke header
    • Toast helper (Toastify fallback ke alert)
    • Render teks rekomendasi (bulletify, sanitasi ringan)
    • Event hooks: alert timer, TTS, welcome → tampilkan toast ringkas

  API global (window.SitSenseUI):
    setTheme('dark'|'light'|'system')
    toggleTheme()
    showAdviceText(text)
    showToast(message, type?) // type: 'info'|'success'|'warn'|'error'
*/
(function(){
  const THEME_KEY = 'sitsense_theme';
  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // ---------------- Theme ----------------
  function applyTheme(mode){
    const html = document.documentElement; // <html>
    if (mode === 'system') mode = prefersDark() ? 'dark' : 'light';
    html.setAttribute('data-theme', mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch(_) {}
  }
  function getTheme(){ try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch(_) { return 'dark'; } }
  function setTheme(mode){ applyTheme(mode); paintToggle(mode); }
  function toggleTheme(){ setTheme(getTheme()==='dark' ? 'light' : 'dark'); }

  function createThemeToggle(){
    const header = document.querySelector('header .max-w-7xl');
    if (!header) return;
    if (document.getElementById('themeToggle')) return; // avoid dup
    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.className = 'inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs';
    btn.innerHTML = '<i data-lucide="sun" class="h-4 w-4"></i><span>Mode</span>';
    btn.addEventListener('click', toggleTheme);
    header.appendChild(btn);
    if (window.lucide) window.lucide.createIcons();
    paintToggle(getTheme());
  }
  function paintToggle(mode){
    const btn = document.getElementById('themeToggle'); if (!btn) return;
    const icon = btn.querySelector('i'); if (!icon) return;
    icon.setAttribute('data-lucide', mode==='dark' ? 'moon' : 'sun');
    if (window.lucide) window.lucide.createIcons();
  }

  // ---------------- Toast ----------------
  function showToast(message, type='info'){
    const colors = {
      info:   'linear-gradient(90deg, #3b82f6, #06b6d4)',
      success:'linear-gradient(90deg, #10b981, #34d399)',
      warn:   'linear-gradient(90deg, #f59e0b, #f97316)',
      error:  'linear-gradient(90deg, #ef4444, #f43f5e)'
    };
    if (window.Toastify){
      window.Toastify({ text: String(message), duration: 3000, gravity: 'top', position: 'right', close: true, style: { background: colors[type] || colors.info } }).showToast();
    } else {
      // Fallback
      console.log('[Toast]', type, message);
      try { alert(message); } catch(_) {}
    }
  }

  // ---------------- Advice rendering ----------------
  function escapeHTML(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function bulletify(text){
    const safe = escapeHTML(text).trim();
    const lines = safe.split(/\r?\n+/).map(l=>l.trim()).filter(Boolean);
    if (!lines.length) return safe;
    // deteksi baris bullet (•, -, *) atau penomoran
    const isBullet = lines.every(l => /^[•\-*\d+\.\)]\s?/.test(l));
    if (!isBullet){ return lines.join('<br>'); }
    const items = lines.map(l => l.replace(/^[•\-*\d+\.\)]\s?/, ''));
    return '<ul class="list-disc pl-5 space-y-1">' + items.map(li=>`<li>${li}</li>`).join('') + '</ul>';
  }
  function showAdviceText(text){
    const el = document.getElementById('adviceText');
    if (!el) return;
    el.innerHTML = bulletify(text || '—');
  }

  // ---------------- Event hooks ----------------
  function hookEvents(){
    // Alerts thresholds → toast
    document.addEventListener('sitsense:alert', (e)=>{
      const { type, elapsed } = e.detail || {}; // soft|hard
      const mm = Math.floor((elapsed||0)/60);
      if (type === 'hard') showToast(`Sudah duduk ${mm} menit. Saatnya berdiri dan peregangan.`, 'warn');
      else if (type === 'soft') showToast(`Duduk ${mm} menit. Istirahat singkat sebentar ya.`, 'info');
    });

    // Timer lifecycle
    document.addEventListener('sitsense:timer:start', ()=> showToast('Timer duduk dimulai', 'success'));
    document.addEventListener('sitsense:timer:stop', ()=> showToast('Timer dijeda', 'info'));
    document.addEventListener('sitsense:timer:reset', ()=> showToast('Timer direset', 'info'));

    // TTS lifecycle
    document.addEventListener('sitsense:tts:start', ()=> showToast('Membacakan rekomendasi…', 'info'));
    document.addEventListener('sitsense:tts:end',   ()=> showToast('Selesai dibacakan', 'success'));
    document.addEventListener('sitsense:tts:error', ()=> showToast('Gagal memutar suara', 'error'));

    // Welcome hidden → cue small toast
    document.addEventListener('sitsense:welcome:hidden', ()=> showToast('Selamat datang di SitSense!', 'success'));
  }

  // ---------------- NProgress helpers (opsional) ----------------
  function bindAdviceButtons(){
    const btnAsk = document.getElementById('btnRefreshAdvice');
    if (!btnAsk || btnAsk.dataset.uiBound === '1') return;
    btnAsk.dataset.uiBound = '1';
    btnAsk.addEventListener('click', async ()=>{
      if (window.NProgress) NProgress.start();
      try {
        // Jika app.js sudah mengikat klik, kita hanya menampilkan progress bar.
        // Jika belum, jalankan fallback kecil agar tetap berguna.
        if (!window.getPostureAdvice) return;
        if (window.__UI_ranFallback) return; // cegah dobel
        window.__UI_ranFallback = true;
        const advice = await window.getPostureAdvice({
          score: window.__postureScore || 60,
          imbalance: window.__imbalance || { lr:0.2, fb:0.1 },
          durationSec: window.SitSenseAlerts?.getElapsedSeconds?.() || 0,
          lastAlerts: '-',
        });
        showAdviceText(advice.text);
      } catch(_) {}
      finally { if (window.NProgress) NProgress.done(); setTimeout(()=>{ window.__UI_ranFallback = false; }, 300); }
    });

    const btnListen = document.getElementById('btnListenAdvice');
    if (btnListen && btnListen.dataset.uiBound !== '1'){
      btnListen.dataset.uiBound = '1';
      btnListen.addEventListener('click', async ()=>{
        if (!window.speakText){ showToast('TTS belum siap.', 'error'); return; }
        const text = (document.getElementById('adviceText')?.textContent || '').trim();
        if (!text){ showToast('Belum ada rekomendasi untuk dibacakan.', 'warn'); return; }
        if (window.NProgress) NProgress.start();
        try { await window.speakText(text, { voice: 'id-ID-Standard-A' }); }
        finally { if (window.NProgress) NProgress.done(); }
      });
    }
  }

  // ---------------- Boot ----------------
  document.addEventListener('DOMContentLoaded', ()=>{
    applyTheme(getTheme());
    createThemeToggle();
    hookEvents();
    bindAdviceButtons();
  });

  // Public API
  window.SitSenseUI = { setTheme, toggleTheme, showAdviceText, showToast };
  window.showAdviceText = window.showAdviceText || showAdviceText;
})();
