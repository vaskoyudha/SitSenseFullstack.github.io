/**
 * SitSense — TTS Utility
 * Text-to-Speech dengan fallback ke Web Speech API
 */

const STATE = {
  proxyUrl: window.__TTS_PROXY_URL || null,
  apiKey: null,
  voice: 'id-ID-Standard-A',
  lang: 'id-ID',
  pitch: 0.0,
  rate: 1.0,
  audioEncoding: 'MP3',
  _audioEl: null,
  _speaking: false,
};

/**
 * Set TTS configuration
 */
export const setTTSConfig = (cfg = {}) => {
  if (cfg.proxyUrl) STATE.proxyUrl = cfg.proxyUrl;
  if (cfg.apiKey) STATE.apiKey = cfg.apiKey;
  if (cfg.voice) STATE.voice = cfg.voice;
  if (cfg.lang) STATE.lang = cfg.lang;
  if (Number.isFinite(cfg.pitch)) STATE.pitch = cfg.pitch;
  if (Number.isFinite(cfg.rate)) STATE.rate = cfg.rate;
  if (cfg.audioEncoding) STATE.audioEncoding = cfg.audioEncoding;
};

/**
 * Dispatch TTS event
 */
const dispatch = (type, detail) => {
  document.dispatchEvent(new CustomEvent(`sitsense:tts:${type}`, { detail }));
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url, options, timeoutMs = 15000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
};

/**
 * Speak via proxy (Google Cloud TTS)
 */
const speakViaProxy = async (text, opts) => {
  const url = STATE.proxyUrl;
  if (!url) return false;
  
  const body = {
    text,
    voice: {
      languageCode: opts.lang || STATE.lang,
      name: opts.voice || STATE.voice,
    },
    audioConfig: {
      audioEncoding: opts.audioEncoding || STATE.audioEncoding,
      pitch: opts.pitch ?? STATE.pitch,
      speakingRate: opts.rate ?? STATE.rate,
    },
  };
  
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) throw new Error(`TTS Proxy ${res.status}`);
  const data = await res.json();
  const b64 = data?.audioContent;
  if (!b64) throw new Error('TTS Proxy: audioContent kosong');
  
  await playBase64(b64, opts.audioEncoding || STATE.audioEncoding);
  return true;
};

/**
 * Speak via Google Cloud directly (experimental)
 */
const speakViaGoogleDirect = async (text, opts) => {
  if (!STATE.apiKey) return false;
  
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(STATE.apiKey)}`;
  const body = {
    input: { text },
    voice: {
      languageCode: opts.lang || STATE.lang,
      name: opts.voice || STATE.voice,
    },
    audioConfig: {
      audioEncoding: opts.audioEncoding || STATE.audioEncoding,
      pitch: opts.pitch ?? STATE.pitch,
      speakingRate: opts.rate ?? STATE.rate,
    },
  };
  
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) throw new Error(`Google TTS ${res.status}`);
  const data = await res.json();
  const b64 = data?.audioContent;
  if (!b64) throw new Error('Google TTS: audioContent kosong');
  
  await playBase64(b64, opts.audioEncoding || STATE.audioEncoding);
  return true;
};

/**
 * Pick Web Speech voice
 */
const pickWebVoice = (langPref) => {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const exact = voices.find((v) => v.lang === langPref);
  if (exact) return exact;
  const starts = voices.find((v) => v.lang && v.lang.startsWith(langPref.split('-')[0]));
  return starts || voices[0] || null;
};

/**
 * Speak via Web Speech API (fallback)
 */
const speakViaWeb = async (text, opts) => {
  if (!('speechSynthesis' in window)) return false;
  
  return new Promise((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    const pitchWeb = Math.max(0, Math.min(2, 1 + (opts.pitch ?? STATE.pitch) / 10));
    u.pitch = pitchWeb;
    u.rate = Math.max(0.25, Math.min(3.5, opts.rate ?? STATE.rate));
    u.lang = opts.lang || STATE.lang;
    
    const v = pickWebVoice(u.lang);
    if (v) u.voice = v;
    
    u.onstart = () => {
      STATE._speaking = true;
      dispatch('start', { backend: 'web' });
    };
    
    u.onend = () => {
      STATE._speaking = false;
      dispatch('end', { backend: 'web' });
      resolve();
    };
    
    u.onerror = (e) => {
      STATE._speaking = false;
      dispatch('error', { backend: 'web', error: String(e?.error || e) });
      reject(e);
    };
    
    window.speechSynthesis.speak(u);
  });
};

/**
 * Play base64 audio
 */
const playBase64 = async (b64, encoding = 'MP3') => {
  const mime = encoding === 'OGG_OPUS' ? 'audio/ogg' : encoding === 'LINEAR16' ? 'audio/wav' : 'audio/mpeg';
  const src = `data:${mime};base64,${b64}`;
  
  if (!STATE._audioEl) {
    STATE._audioEl = new Audio();
    STATE._audioEl.preload = 'auto';
  }
  
  const el = STATE._audioEl;
  
  return new Promise((resolve, reject) => {
    el.onended = () => {
      STATE._speaking = false;
      dispatch('end', { backend: 'gcloud' });
      resolve();
    };
    
    el.onerror = (e) => {
      STATE._speaking = false;
      dispatch('error', { backend: 'gcloud', error: 'audio error' });
      reject(e);
    };
    
    el.src = src;
    el.currentTime = 0;
    el.volume = 1;
    STATE._speaking = true;
    dispatch('start', { backend: 'gcloud' });
    
    el.play().catch((err) => {
      // Autoplay blocked → wait for gesture
      const once = () => {
        document.removeEventListener('click', once);
        document.removeEventListener('touchstart', once);
        el.play().then(resolve).catch(reject);
      };
      document.addEventListener('click', once, { once: true });
      document.addEventListener('touchstart', once, { once: true });
    });
  });
};

/**
 * Preload TTS (unlock audio on first gesture)
 */
export const preloadTTS = async () => {
  if (!STATE._audioEl) {
    STATE._audioEl = new Audio();
    STATE._audioEl.preload = 'auto';
  }
  try {
    await STATE._audioEl.play();
    STATE._audioEl.pause();
  } catch (_) {
    // Ignore
  }
  // Trigger WebSpeech voices load
  if (window.speechSynthesis?.getVoices) {
    window.speechSynthesis.getVoices();
  }
};

/**
 * Stop speaking
 */
export const stopSpeaking = () => {
  try {
    if (STATE._audioEl) {
      STATE._audioEl.pause();
      STATE._audioEl.currentTime = 0;
    }
  } catch (_) {
    // Ignore
  }
  try {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
  } catch (_) {
    // Ignore
  }
  STATE._speaking = false;
  dispatch('end', { backend: 'any', stopped: true });
};

/**
 * Check if speaking
 */
export const isSpeaking = () => {
  return !!STATE._speaking || (window.speechSynthesis?.speaking || false);
};

/**
 * List available voices
 */
export const listVoices = async () => {
  const webVoices = window.speechSynthesis?.getVoices?.() || [];
  const gcloudVoicesHint = [
    'id-ID-Standard-A',
    'id-ID-Standard-B',
    'id-ID-Standard-C',
    'id-ID-Standard-D',
    'id-ID-Wavenet-A',
    'id-ID-Wavenet-B',
    'id-ID-Wavenet-C',
    'id-ID-Wavenet-D',
  ];
  return { webVoices, gcloudVoicesHint };
};

/**
 * Speak text (main function)
 */
export const speakText = async (text, opts = {}) => {
  if (!text || !String(text).trim()) return;
  
  const o = Object.assign({}, opts);
  
  try {
    // 1) Try proxy → Google Cloud (recommended)
    if (STATE.proxyUrl) {
      if (await speakViaProxy(text, o)) return;
    }
    // 2) Try direct → Google Cloud (may fail without OAuth)
    if (STATE.apiKey) {
      if (await speakViaGoogleDirect(text, o)) return;
    }
    // 3) Fallback to Web Speech
    await speakViaWeb(text, o);
  } catch (err) {
    dispatch('error', { error: String(err) });
    // Last resort: try Web Speech if not already tried
    try {
      await speakViaWeb(text, o);
    } catch (_) {
      // Ignore
    }
  }
};

// Auto-config from window globals if available
if (typeof window !== 'undefined') {
  if (window.__TTS_PROXY_URL) STATE.proxyUrl = window.__TTS_PROXY_URL;
  if (window.__TTS_VOICE) STATE.voice = window.__TTS_VOICE;
}

