/*
  SitSense — ai-gemini.js
  ---------------------------------
  Ambil rekomendasi postur dari Google Gemini (Generative Language API).

  ⚠️ Keamanan: Dianjurkan memakai PROXY server-side agar API key tidak diekspos.
  File ini mendukung 3 mode:
    1) PROXY (disarankan): set window.__GEMINI_PROXY_URL ke endpoint milikmu.
       - Metode: POST { prompt, model, system, generationConfig }
       - Harus balas { text: "..." }
    2) Direct browser (sementara): set API key via SitSenseAI.setConfig({ apiKey })
       - Panggil endpoint resmi Google: /v1beta/models/{model}:generateContent
    3) Fallback dummy: mengembalikan saran lokal jika belum dikonfigurasi.

  API publik:
    SitSenseAI.setConfig({ apiKey?, proxyUrl?, model?, lang? })
    getPostureAdvice({ score, imbalance:{lr,fb}, durationSec, lastAlerts, pressureMatrix? }) -> Promise<{ text, rationale? }>
*/
(function(){
  const DEFAULT_MODEL = 'gemini-1.5-flash'; // cepat & cukup untuk rekomendasi singkat
  const STATE = {
    apiKey: null,
    proxyUrl: (typeof window !== 'undefined' && window.__GEMINI_PROXY_URL) ? window.__GEMINI_PROXY_URL : null,
    model: DEFAULT_MODEL,
    lang: 'id-ID',
    timeoutMs: 12000,
  };

  function setConfig(cfg={}){
    if (cfg.apiKey) STATE.apiKey = cfg.apiKey;
    if (cfg.proxyUrl) STATE.proxyUrl = cfg.proxyUrl;
    if (cfg.model) STATE.model = cfg.model;
    if (cfg.lang) STATE.lang = cfg.lang;
  }

  function safeJson(o){ try { return JSON.stringify(o); } catch(_) { return '{}'; } }

  function buildSystem(){
    return (
`Anda adalah pelatih ergonomi untuk aplikasi SitSense (Bahasa Indonesia). 
Tujuan: berikan rekomendasi singkat, praktis, dan aman untuk memperbaiki postur duduk berdasarkan parameter yang diberikan. 
Gaya: ramah, langsung ke poin, hindari istilah medis berlebihan. Maks 3-5 butir.
Jika situasi berisiko (skor < 40 atau durasi > 120 menit), tambahkan peringatan ringkas.
Jangan berikan saran medis—sarankan konsultasi profesional bila keluhan berlanjut.`
    );
  }

  function toMMSS(sec){ sec=Math.max(0,Math.floor(sec)); const m=Math.floor(sec/60); const s=sec%60; return `${m}m ${String(s).padStart(2,'0')}s`; }

  function buildPrompt({ score=50, imbalance={lr:0,fb:0}, durationSec=0, lastAlerts='-', pressureMatrix }){
    const lrPct = Math.round(Math.min(1, Math.abs(imbalance.lr||0)) * 100);
    const fbPct = Math.round(Math.min(1, Math.abs(imbalance.fb||0)) * 100);
    const duration = toMMSS(durationSec||0);
    const shapeHint = Array.isArray(pressureMatrix) ? `Matriks ${pressureMatrix.length}x${pressureMatrix[0]?.length||pressureMatrix.length}` : 'Matriks tidak tersedia';
    return (
`DATA:
- Skor postur: ${score}
- Ketidakseimbangan: kiri/kanan ~ ${lrPct}%, depan/belakang ~ ${fbPct}%
- Durasi duduk: ${duration}
- Alert terakhir: ${String(lastAlerts)}
- Heatmap: ${shapeHint}

TUGAS:
Berikan rekomendasi ringkas untuk memperbaiki postur saat ini. 
Format: 3-5 poin bullet pendek. Gunakan kalimat sederhana. 
Tambahkan satu kalimat ringkas yang memotivasi di akhir. 
Pastikan semua output dalam Bahasa Indonesia.`
    );
  }

  function parseGeminiText(json){
    try{
      // Google Generative Language API v1beta shape
      const cands = json?.candidates; if (!Array.isArray(cands) || !cands[0]) return null;
      const parts = cands[0]?.content?.parts; if (!Array.isArray(parts)) return null;
      const text = parts.map(p=>p.text).filter(Boolean).join('\n');
      return text || null;
    }catch(_){ return null; }
  }

  async function fetchWithTimeout(url, options){
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(), STATE.timeoutMs);
    try{ return await fetch(url, { ...options, signal: ctrl.signal }); }
    finally{ clearTimeout(id); }
  }

  async function callViaProxy(payload){
    const url = STATE.proxyUrl;
    if (!url) return null;
    const res = await fetchWithTimeout(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: payload.prompt, system: payload.system, model: STATE.model, generationConfig: payload.generationConfig })
    });
    if (!res.ok) throw new Error(`Proxy ${res.status}`);
    const data = await res.json();
    // Proxy diharapkan mengembalikan { text } atau bentuk resmi Google
    if (typeof data?.text === 'string') return data.text;
    const maybe = parseGeminiText(data);
    return maybe || null;
  }

  async function callDirect(payload){
    if (!STATE.apiKey) return null;
    const base = 'https://generativelanguage.googleapis.com/v1beta';
    const endpoint = `${base}/models/${encodeURIComponent(STATE.model)}:generateContent?key=${encodeURIComponent(STATE.apiKey)}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: payload.prompt }]}],
      systemInstruction: { role: 'system', parts: [{ text: payload.system }] },
      generationConfig: Object.assign({ temperature: 0.7, topK: 32, topP: 0.9, maxOutputTokens: 256 }, payload.generationConfig||{})
    };

    const res = await fetchWithTimeout(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text = parseGeminiText(data);
    return text || null;
  }

  function fallbackAdvice(payload){
    const { score=50, imbalance={lr:0,fb:0}, durationSec=0 } = payload || {};
    const lr = Math.round((imbalance.lr||0)*100), fb = Math.round((imbalance.fb||0)*100);
    const mins = Math.round(durationSec/60);
    return (
`• Topang punggung: dorong pinggang ke sandaran, bahu rileks.
• Sejajarkan paha & telapak kaki rata; atur tinggi kursi jika perlu.
• Geser beban agar kiri/kanan (${lr}% ) & depan/belakang (${fb}% ) lebih seimbang.
• Istirahat singkat ${Math.max(1, Math.min(5, Math.ceil(mins/30)))} menit, lalu peregangan leher & bahu.
Tetap konsisten—perbaikan kecil tapi sering lebih efektif.`
    );
  }

  async function getPostureAdvice(input={}){
    const system = buildSystem();
    const prompt = buildPrompt(input);
    const generationConfig = { temperature: 0.6, maxOutputTokens: 220 };
    const payload = { system, prompt, generationConfig };

    try{
      // 1) Proxy first (jika ada)
      if (STATE.proxyUrl){
        const text = await callViaProxy(payload);
        if (text) return { text };
      }
      // 2) Direct (jika apiKey di-set)
      if (STATE.apiKey){
        const text = await callDirect(payload);
        if (text) return { text };
      }
      // 3) Fallback dummy
      console.warn('[SitSense AI] Gemini belum dikonfigurasi, menggunakan saran lokal.');
      return { text: fallbackAdvice(input), rationale: 'fallback' };
    }catch(err){
      console.warn('[SitSense AI] Gagal memanggil Gemini:', err);
      return { text: fallbackAdvice(input), rationale: 'error-fallback' };
    }
  }

  // Expose global
  window.SitSenseAI = { setConfig, get config(){ return { ...STATE }; } };
  window.getPostureAdvice = getPostureAdvice;

  // Optional auto-config dari window globals
  if (typeof window !== 'undefined'){
    if (window.__GEMINI_API_KEY) STATE.apiKey = window.__GEMINI_API_KEY;
    if (window.__GEMINI_MODEL) STATE.model = window.__GEMINI_MODEL;
    if (window.__GEMINI_LANG) STATE.lang = window.__GEMINI_LANG;
  }
})();
