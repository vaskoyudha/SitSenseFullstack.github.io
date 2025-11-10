/**
 * SitSense — alerts.js
 * Audio alerts utility dengan handling autoplay policy
 */

let pendingAudio = null;

/**
 * Format seconds to HH:MM:SS
 */
export const formatDuration = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
};

/**
 * Format seconds to human-readable minutes
 */
export const toHumanMin = (seconds) => {
  const m = Math.round(seconds / 60);
  return m >= 60 
    ? `${Math.floor(m / 60)}j${String(m % 60).padStart(2, '0')}m` 
    : `${m}m`;
};

/**
 * Get audio element by type
 */
const getAudioEl = (type) => {
  const audioId = type === 'hard' ? 'alertHard' : 'alertSoft';
  return document.getElementById(audioId);
};

/**
 * Play alert audio with autoplay policy handling
 */
export const playAlert = async (type, muted = false) => {
  if (muted) return;
  
  const el = getAudioEl(type);
  if (!el) {
    // Create audio element if it doesn't exist
    const audio = document.createElement('audio');
    audio.id = type === 'hard' ? 'alertHard' : 'alertSoft';
    audio.src = `/assets/audio/${type === 'hard' ? 'alertHard' : 'alertSoft'}.wav`;
    audio.preload = 'auto';
    document.body.appendChild(audio);
    
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      // Autoplay blocked → defer until user gesture
      pendingAudio = type;
      const once = () => {
        document.removeEventListener('click', once);
        document.removeEventListener('touchstart', once);
        const t = pendingAudio;
        pendingAudio = null;
        if (t) {
          const audioEl = getAudioEl(t);
          if (audioEl) audioEl.play().catch(() => {});
        }
      };
      document.addEventListener('click', once, { once: true });
      document.addEventListener('touchstart', once, { once: true });
    }
    
    // Vibrate if available
    if (navigator.vibrate) {
      navigator.vibrate(type === 'hard' ? [60, 40, 60] : 40);
    }
    return;
  }
  
  try {
    el.currentTime = 0;
    await el.play();
  } catch (err) {
    // Autoplay blocked → defer until user gesture
    pendingAudio = type;
    const once = () => {
      document.removeEventListener('click', once);
      document.removeEventListener('touchstart', once);
      const t = pendingAudio;
      pendingAudio = null;
      if (t) {
        const audioEl = getAudioEl(t);
        if (audioEl) audioEl.play().catch(() => {});
      }
    };
    document.addEventListener('click', once, { once: true });
    document.addEventListener('touchstart', once, { once: true });
  }
  
  // Vibrate if available
  if (navigator.vibrate) {
    navigator.vibrate(type === 'hard' ? [60, 40, 60] : 40);
  }
};

/**
 * Initialize audio elements
 */
export const initAudioElements = () => {
  // Create audio elements if they don't exist
  if (!document.getElementById('alertSoft')) {
    const softAudio = document.createElement('audio');
    softAudio.id = 'alertSoft';
    softAudio.src = '/assets/audio/alertSoft.wav';
    softAudio.preload = 'auto';
    document.body.appendChild(softAudio);
  }
  
  if (!document.getElementById('alertHard')) {
    const hardAudio = document.createElement('audio');
    hardAudio.id = 'alertHard';
    hardAudio.src = '/assets/audio/alertHard.wav';
    hardAudio.preload = 'auto';
    document.body.appendChild(hardAudio);
  }
};

