/*
  SitSense — settings.js
  ----------------------
  Mengelola preferensi pengguna (localStorage), menerapkan ke modul:
  • Theme (ui.js)            • Alerts (alerts.js)
  • TTS (tts-google.js)      • AI Gemini (ai-gemini.js)
  Plus: Test TTS, Test Gemini, Export/Import JSON.
*/
(function(){
  const STORAGE_KEY = 'sitsense_settings_v1';
  const DEFAULTS = {
    theme: 'dark',            // 'dark' | 'light' | 'system'
    lang: 'id-ID',
    notif: true,
    alerts: { softMin: 30, hardMin: 60, repeatSoftMin: 15, repeatHardMin: 30, muted: false },
    tts: { voice: 'id-ID-Standard-A', rate: 1.0, pitch: 0, proxyUrl: '' },
    ai: { proxyUrl: '', apiKey: '', model: 'gemini-1.5-flash' },
  };

  // ---------- Utils ----------
  const $ = (s, r=document)=> r.querySelector(s);
  const clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
  const isValidUrl = (u)=> { try { new URL(u); return true; } catch(_) { return false; } };

  function loadSettings(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      const obj = JSON.parse(raw);
      return deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), obj);
    } catch(_) { return JSON.parse(JSON.stringify(DEFAULTS)); }
  }
  function saveSettings(s){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(_) {} }
  function deepMerge(base, extra){
    for (const k in extra){
      if (extra[k] && typeof extra[k]==='object' && !Array.isArray(extra[k])) base[k] = deepMerge(base[k]||{}, extra[k]);
      else base[k] = extra[k];
    }
    return base;
  }

  // ---------- Apply to modules ----------
  function applyTheme(theme){
    try { window.SitSenseUI?.setTheme?.(theme); } catch(_) {}
  }
  function applyNotif(enabled){
    // patch SitSenseUI.showToast jika dimatikan
    if (!window.SitSenseUI) return;
    if (!applyNotif._orig){ applyNotif._orig = window.SitSenseUI.showToast; }
    window.__SITSENSE_NOTIF_ENABLED = !!enabled;
    window.SitSenseUI.showToast = function(message, type){
      if (!window.__SITSENSE_NOTIF_ENABLED) return; // no-op
      return applyNotif._orig?.call(window.SitSenseUI, message, type);
    };
  }
  function applyAlerts(a){
    const A = window.SitSenseAlerts; if (!A) return;
    const soft = clamp(Number(a.softMin)||30, 1, 600) * 60;
    const hard = clamp(Number(a.hardMin)||60, 1, 600) * 60;
    const rSoft = clamp(Number(a.repeatSoftMin)||15, 1, 600) * 60;
    const rHard = clamp(Number(a.repeatHardMin)||30, 1, 600) * 60;
    A.setThresholds({ soft, hard, repeatSoftSec: rSoft, repeatHardSec: rHard });
    A.setMuted(!!a.muted);
  }
  function applyTTS(t){
    if (!window.SitSenseTTS) return;
    const cfg = { voice: t.voice||DEFAULTS.tts.voice, rate: clamp(Number(t.rate)||1, 0.5, 2), pitch: clamp(Number(t.pitch)||0, -10, 10) };
    if (t.proxyUrl && isValidUrl(t.proxyUrl)) cfg.proxyUrl = t.proxyUrl;
    window.SitSenseTTS.setConfig(cfg);
  }
  function applyAI(ai){
    if (!window.SitSenseAI) return;
    const cfg = { model: ai.model||DEFAULTS.ai.model };
    if (ai.proxyUrl && isValidUrl(ai.proxyUrl)) cfg.proxyUrl = ai.proxyUrl;
    if (ai.apiKey && typeof ai.apiKey === 'string') cfg.apiKey = ai.apiKey.trim();
    window.SitSenseAI.setConfig(cfg);
  }

  function applySettings(s){
    applyTheme(s.theme);
    applyNotif(s.notif);
    applyAlerts(s.alerts);
    applyTTS(s.tts);
    applyAI(s.ai);
    // Language dipakai TTS & AI (opsional)
    try { window.SitSenseTTS?.setConfig?.({ lang: s.lang }); } catch(_) {}
    try { window.SitSenseAI?.setConfig?.({ lang: s.lang }); } catch(_) {}
  }

  // ---------- UI sync ----------
  function updateUIFromSettings(s){
    // General
    $('#themeDark')?.toggleAttribute('checked', s.theme==='dark');
    $('#themeLight')?.toggleAttribute('checked', s.theme==='light');
    $('#themeSystem')?.toggleAttribute('checked', s.theme==='system');
    const langSel = $('#langSelect'); if (langSel) langSel.value = s.lang;
    const notif = $('#notifToggle'); if (notif) notif.checked = !!s.notif;

    // Alerts
    $('#softThresholdInput')?.setAttribute('value', String(s.alerts.softMin));
    $('#hardThresholdInput')?.setAttribute('value', String(s.alerts.hardMin));
    $('#repeatSoftInput')?.setAttribute('value', String(s.alerts.repeatSoftMin));
    $('#repeatHardInput')?.setAttribute('value', String(s.alerts.repeatHardMin));
    const mute = $('#muteAlertsToggle'); if (mute) mute.checked = !!s.alerts.muted;

    // TTS
    const vs = $('#voiceSelect'); if (vs) vs.value = s.tts.voice;
    const rate = $('#ttsRate'); if (rate) rate.value = String(s.tts.rate);
    const pitch = $('#ttsPitch'); if (pitch) pitch.value = String(s.tts.pitch);
    const proxy = $('#ttsProxyInput'); if (proxy) proxy.value = s.tts.proxyUrl || '';

    // AI
    const gpx = $('#geminiProxyInput'); if (gpx) gpx.value = s.ai.proxyUrl || '';
    const gak = $('#geminiApiKeyInput'); if (gak) gak.value = s.ai.apiKey || '';
    const gmd = $('#geminiModelSelect'); if (gmd) gmd.value = s.ai.model;
  }

  // ---------- Bind events ----------
  function bind(){
    // Theme
    $('#themeDark')?.addEventListener('click', ()=> applyPick('theme','dark'));
    $('#themeLight')?.addEventListener('click', ()=> applyPick('theme','light'));
    $('#themeSystem')?.addEventListener('click', ()=> applyPick('theme','system'));

    // General
    $('#langSelect')?.addEventListener('change', (e)=> applyPick('lang', e.target.value));
    $('#notifToggle')?.addEventListener('change', (e)=> applyPick('notif', !!e.target.checked));

    // Alerts
    $('#softThresholdInput')?.addEventListener('input', e=> applyNested('alerts','softMin', clamp(parseInt(e.target.value,10)||30, 1, 600)) );
    $('#hardThresholdInput')?.addEventListener('input', e=> applyNested('alerts','hardMin', clamp(parseInt(e.target.value,10)||60, 1, 600)) );
    $('#repeatSoftInput')?.addEventListener('input', e=> applyNested('alerts','repeatSoftMin', clamp(parseInt(e.target.value,10)||15, 1, 600)) );
    $('#repeatHardInput')?.addEventListener('input', e=> applyNested('alerts','repeatHardMin', clamp(parseInt(e.target.value,10)||30, 1, 600)) );
    $('#muteAlertsToggle')?.addEventListener('change', e=> applyNested('alerts','muted', !!e.target.checked));

    $('#testSoftBtn')?.addEventListener('click', ()=> window.SitSenseAlerts?.playAlert?.('soft'));
    $('#testHardBtn')?.addEventListener('click', ()=> window.SitSenseAlerts?.playAlert?.('hard'));

    // TTS
    $('#voiceSelect')?.addEventListener('change', e=> applyNested('tts','voice', e.target.value));
    $('#ttsRate')?.addEventListener('input', e=> applyNested('tts','rate', clamp(parseFloat(e.target.value)||1, 0.5, 2)) );
    $('#ttsPitch')?.addEventListener('input', e=> applyNested('tts','pitch', clamp(parseInt(e.target.value,10)||0, -10, 10)) );
    $('#ttsProxyInput')?.addEventListener('change', e=> applyNested('tts','proxyUrl', e.target.value.trim()) );

    $('#ttsTestBtn')?.addEventListener('click', async ()=>{
      const text = ($('#ttsTestText')?.value || 'Halo! Ini adalah suara asisten SitSense.').trim();
      try { await window.speakText?.(text, { voice: getSettings().tts.voice, rate: getSettings().tts.rate, pitch: getSettings().tts.pitch }); }
      catch(_){}
    });
    $('#ttsStopBtn')?.addEventListener('click', ()=> window.stopSpeaking?.());

    // AI Gemini
    $('#geminiProxyInput')?.addEventListener('change', e=> applyNested('ai','proxyUrl', e.target.value.trim()));
    $('#geminiApiKeyInput')?.addEventListener('change', e=> applyNested('ai','apiKey', e.target.value.trim()));
    $('#geminiModelSelect')?.addEventListener('change', e=> applyNested('ai','model', e.target.value));
    $('#geminiTestBtn')?.addEventListener('click', testGeminiConnection);

    // Import/Export/Save/Reset
    $('#exportSettingsBtn')?.addEventListener('click', exportJSON);
    $('#importFile')?.addEventListener('change', importJSON);
    $('#resetSettingsBtn')?.addEventListener('click', resetDefaults);
    $('#saveSettingsBtn')?.addEventListener('click', ()=>{ saveSettings(getSettings()); toast('Pengaturan disimpan','success'); });
  }

  // ---------- Settings state (in-memory cache) ----------
  let _settings = null;
  function getSettings(){ if (!_settings) _settings = loadSettings(); return _settings; }
  function setSettings(s){ _settings = s; saveSettings(s); applySettings(s); }

  function applyPick(key, value){ const s = getSettings(); s[key] = value; setSettings(s); updateUIFromSettings(s); }
  function applyNested(scope, key, value){ const s = getSettings(); s[scope][key] = value; setSettings(s); updateUIFromSettings(s); }

  // ---------- Export/Import ----------
  function exportJSON(){
    const blob = new Blob([JSON.stringify(getSettings(), null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`sitsense-settings-${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  function importJSON(e){
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = ()=>{
      try{
        const obj = JSON.parse(String(rd.result||'{}'));
        // Validasi minimum
        const merged = deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), obj || {});
        setSettings(merged); updateUIFromSettings(merged);
        toast('Pengaturan diimpor','success');
      }catch(err){ toast('File tidak valid','error'); }
    };
    rd.readAsText(f);
  }
  function resetDefaults(){ setSettings(JSON.parse(JSON.stringify(DEFAULTS))); updateUIFromSettings(getSettings()); toast('Kembali ke default','info'); }

  // ---------- Gemini Test ----------
  async function testGeminiConnection(){
    const el = $('#geminiTestStatus'); if (el) el.textContent = 'Menguji…';
    try {
      if (!window.getPostureAdvice){ throw new Error('Modul AI belum dimuat'); }
      const res = await window.getPostureAdvice({ score: 60, imbalance: { lr: 0.1, fb: 0.1 }, durationSec: 600, lastAlerts: '-' });
      if (typeof res?.text === 'string' && res.text.trim()){
        if (el) el.textContent = 'Terhubung ✓';
        toast('Koneksi Gemini OK','success');
      } else {
        if (el) el.textContent = 'Tidak ada respons';
        toast('Gemini tidak merespons','warn');
      }
    } catch(err){ if (el) el.textContent = 'Gagal'; toast('Gagal menghubungkan Gemini','error'); }
  }

  // ---------- Toast helper ----------
  function toast(msg, type){ try { window.SitSenseUI?.showToast?.(msg, type); } catch(_) { console.log('[Toast]', type, msg); } }

  // ---------- Populate voice list (optional) ----------
  async function populateVoices(){
    try{
      if (!window.listVoices) return;
      const { webVoices, gcloudVoicesHint } = await window.listVoices();
      const sel = $('#voiceSelect'); if (!sel) return;
      const current = new Set(Array.from(sel.options).map(o=>o.value));
      // Tambahkan web voices yang sesuai lang
      for (const v of webVoices){ if (v.lang && v.lang.startsWith((getSettings().lang||'id-ID').split('-')[0])) { if (!current.has(v.name)){ const opt=document.createElement('option'); opt.value=v.name; opt.textContent=v.name; sel.appendChild(opt); current.add(v.name);} } }
      // Tambahkan hint gcloud jika belum ada
      for (const name of gcloudVoicesHint||[]){ if (!current.has(name)){ const opt=document.createElement('option'); opt.value=name; opt.textContent=name; sel.appendChild(opt); current.add(name);} }
    } catch(_) {}
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', ()=>{
    try {
      const s = getSettings();
      updateUIFromSettings(s);
      applySettings(s);
      bind();
      populateVoices();
    } catch(err){ console.warn('[SitSense] settings init error', err); }
  });
})();
