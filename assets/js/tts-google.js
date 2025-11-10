/*
  SitSense — tts-google.js
  ---------------------------------
  Text → Speech dengan 3 jalur:
    1) PROXY (disarankan): window.__TTS_PROXY_URL mengarah ke server kamu yang memanggil Google Cloud Text‑to‑Speech.
       - Request: POST JSON { text, voice: { languageCode, name }, audioConfig: { audioEncoding, pitch, speakingRate } }
       - Response: { audioContent: <base64 audio> }  (standar Google)
    2) Direct (eksperimental): set SitSenseTTS.setConfig({ apiKey }) lalu hit endpoint Google langsung.
       - Catatan: Google TTS umumnya butuh OAuth service account; API key bisa gagal.
    3) Fallback: Web Speech Synthesis API (browser) bila 1/2 tidak tersedia.

  API publik:
    SitSenseTTS.setConfig({ proxyUrl?, apiKey?, voice?, lang?, pitch?, rate?, audioEncoding? })
    speakText(text, opts?) -> Promise<void>
    preloadTTS() -> Promise<void>
    stopSpeaking()
    isSpeaking() -> boolean
    listVoices() -> Promise<{ webVoices: SpeechSynthesisVoice[]|[], gcloudVoicesHint: string[] }>

  Event:
    document: 'sitsense:tts:start' | 'sitsense:tts:end' | 'sitsense:tts:error'
*/
(function(){
  const STATE = {
    proxyUrl: (typeof window !== 'undefined' && window.__TTS_PROXY_URL) ? window.__TTS_PROXY_URL : null,
    apiKey: null,
    voice: 'id-ID-Standard-A',    // Google TTS voice name (contoh)
    lang: 'id-ID',
    pitch: 0.0,                   // -20..20 (Google), WebSpeech: -1..2 → kita map ringan
    rate: 1.0,                    // 0.25..4 (Google & WebSpeech)
    audioEncoding: 'MP3',         // 'MP3' | 'OGG_OPUS' | 'LINEAR16'
    _audioEl: null,
    _speaking: false,
  };

  function setConfig(cfg={}){
    if (cfg.proxyUrl) STATE.proxyUrl = cfg.proxyUrl;
    if (cfg.apiKey) STATE.apiKey = cfg.apiKey;
    if (cfg.voice) STATE.voice = cfg.voice;
    if (cfg.lang) STATE.lang = cfg.lang;
    if (Number.isFinite(cfg.pitch)) STATE.pitch = cfg.pitch;
    if (Number.isFinite(cfg.rate)) STATE.rate = cfg.rate;
    if (cfg.audioEncoding) STATE.audioEncoding = cfg.audioEncoding;
  }

  function dispatch(type, detail){
    document.dispatchEvent(new CustomEvent(`sitsense:tts:${type}`, { detail }));
  }

  async function fetchWithTimeout(url, options, timeoutMs=15000){
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: ctrl.signal }); }
    finally { clearTimeout(id); }
  }

  // ---------- GOOGLE CLOUD via PROXY ----------
  async function speakViaProxy(text, opts){
    const url = STATE.proxyUrl; if (!url) return false;
    const body = {
      text,
      voice: { languageCode: opts.lang || STATE.lang, name: opts.voice || STATE.voice },
      audioConfig: { audioEncoding: opts.audioEncoding || STATE.audioEncoding, pitch: opts.pitch ?? STATE.pitch, speakingRate: opts.rate ?? STATE.rate }
    };
    const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`TTS Proxy ${res.status}`);
    const data = await res.json();
    const b64 = data?.audioContent; if (!b64) throw new Error('TTS Proxy: audioContent kosong');
    await playBase64(b64, (opts.audioEncoding || STATE.audioEncoding));
    return true;
  }

  // ---------- GOOGLE CLOUD direct (eksperimental) ----------
  async function speakViaGoogleDirect(text, opts){
    if (!STATE.apiKey) return false;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(STATE.apiKey)}`;
    const body = {
      input: { text },
      voice: { languageCode: opts.lang || STATE.lang, name: opts.voice || STATE.voice },
      audioConfig: { audioEncoding: opts.audioEncoding || STATE.audioEncoding, pitch: opts.pitch ?? STATE.pitch, speakingRate: opts.rate ?? STATE.rate }
    };
    const res = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Google TTS ${res.status}`);
    const data = await res.json();
    const b64 = data?.audioContent; if (!b64) throw new Error('Google TTS: audioContent kosong');
    await playBase64(b64, (opts.audioEncoding || STATE.audioEncoding));
    return true;
  }

  // ---------- Web Speech fallback ----------
  function pickWebVoice(langPref){
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const exact = voices.find(v => v.lang === langPref);
    if (exact) return exact;
    const starts = voices.find(v => v.lang && v.lang.startsWith(langPref.split('-')[0]));
    return starts || voices[0] || null;
  }

  async function speakViaWeb(text, opts){
    if (!('speechSynthesis' in window)) return false;
    return new Promise((resolve, reject)=>{
      const u = new SpeechSynthesisUtterance(text);
      const pitchWeb = Math.max(0, Math.min(2, 1 + (opts.pitch ?? STATE.pitch) / 10));
      u.pitch = pitchWeb; u.rate = Math.max(.25, Math.min(3.5, opts.rate ?? STATE.rate));
      u.lang = opts.lang || STATE.lang;
      const v = pickWebVoice(u.lang);
      if (v) u.voice = v;
      u.onstart = () => { STATE._speaking = true; dispatch('start', { backend: 'web' }); };
      u.onend = () => { STATE._speaking = false; dispatch('end', { backend: 'web' }); resolve(); };
      u.onerror = (e) => { STATE._speaking = false; dispatch('error', { backend: 'web', error: String(e?.error || e) }); reject(e); };
      window.speechSynthesis.speak(u);
    });
  }

  // ---------- Player helpers ----------
  async function playBase64(b64, encoding='MP3'){
    const mime = encoding === 'OGG_OPUS' ? 'audio/ogg' : (encoding === 'LINEAR16' ? 'audio/wav' : 'audio/mpeg');
    const src = `data:${mime};base64,${b64}`;
    if (!STATE._audioEl){ STATE._audioEl = new Audio(); STATE._audioEl.preload = 'auto'; }
    const el = STATE._audioEl;
    return new Promise((resolve, reject)=>{
      el.onended = ()=>{ STATE._speaking = false; dispatch('end', { backend: 'gcloud' }); resolve(); };
      el.onerror = (e)=>{ STATE._speaking = false; dispatch('error', { backend: 'gcloud', error: 'audio error' }); reject(e); };
      el.src = src;
      el.currentTime = 0;
      el.volume = 1;
      STATE._speaking = true;
      dispatch('start', { backend: 'gcloud' });
      el.play().catch(err=>{
        // Autoplay kemungkinan diblokir → tunggu gesture
        const once = ()=>{ document.removeEventListener('click', once); document.removeEventListener('touchstart', once); el.play().then(resolve).catch(reject); };
        document.addEventListener('click', once, { once: true });
        document.addEventListener('touchstart', once, { once: true });
      });
    });
  }

  async function preloadTTS(){
    // Unlock audio pada gesture pertama
    if (!STATE._audioEl){ STATE._audioEl = new Audio(); STATE._audioEl.preload = 'auto'; }
    try { STATE._audioEl.play().then(()=>STATE._audioEl.pause()).catch(()=>{}); } catch(_) {}
    // WebSpeech voices bisa muncul async; panggil getVoices() untuk trigger load
    if (window.speechSynthesis?.getVoices){ window.speechSynthesis.getVoices(); }
  }

  function stopSpeaking(){
    try { if (STATE._audioEl){ STATE._audioEl.pause(); STATE._audioEl.currentTime = 0; } } catch(_) {}
    try { if (window.speechSynthesis?.speaking){ window.speechSynthesis.cancel(); } } catch(_) {}
    STATE._speaking = false; dispatch('end', { backend: 'any', stopped: true });
  }

  function isSpeaking(){ return !!STATE._speaking || (window.speechSynthesis?.speaking || false); }

  async function listVoices(){
    const webVoices = (window.speechSynthesis?.getVoices?.() || []);
    const gcloudVoicesHint = [
      'id-ID-Standard-A','id-ID-Standard-B','id-ID-Standard-C','id-ID-Standard-D',
      'id-ID-Wavenet-A','id-ID-Wavenet-B','id-ID-Wavenet-C','id-ID-Wavenet-D'
    ];
    return { webVoices, gcloudVoicesHint };
  }

  // ---------- Router ----------
  async function speakText(text, opts={}){
    if (!text || !String(text).trim()) return;
    const o = Object.assign({}, opts);
    try{
      // 1) Proxy → Google Cloud (disarankan)
      if (STATE.proxyUrl){ if (await speakViaProxy(text, o)) return; }
      // 2) Direct → Google Cloud (mungkin gagal tanpa OAuth)
      if (STATE.apiKey){ if (await speakViaGoogleDirect(text, o)) return; }
      // 3) Fallback Web Speech
      await speakViaWeb(text, o);
    }catch(err){
      dispatch('error', { error: String(err) });
      // terakhir, coba fallback web speech jika belum
      try { await speakViaWeb(text, o); } catch(_) {}
    }
  }

  // Expose global
  window.SitSenseTTS = { setConfig, get config(){ return { ...STATE }; } };
  window.speakText = speakText;
  window.preloadTTS = preloadTTS;
  window.stopSpeaking = stopSpeaking;
  window.isSpeaking = isSpeaking;
  window.listVoices = listVoices;

  // Auto-config dari window globals jika ada
  if (typeof window !== 'undefined'){
    if (window.__TTS_PROXY_URL) STATE.proxyUrl = window.__TTS_PROXY_URL;
    if (window.__TTS_VOICE) STATE.voice = window.__TTS_VOICE;
  }
})();
