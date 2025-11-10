/**
 * UI Utilities
 * Helper functions for UI interactions
 */

/**
 * Show toast notification
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  document.dispatchEvent(
    new CustomEvent('sitsense:toast', {
      detail: { message, type, duration },
    })
  );
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHTML = (s) => {
  return String(s).replace(/[&<>]/g, (c) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return map[c] || c;
  });
};

/**
 * Format text as bullet points
 */
export const bulletify = (text) => {
  const safe = escapeHTML(text).trim();
  const lines = safe
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  
  if (!lines.length) return safe;
  
  // Detect if already bulleted
  const isBullet = lines.every((l) => /^[•\-*\d+\.\)]\s?/.test(l));
  if (!isBullet) {
    return lines.join('<br>');
  }
  
  const items = lines.map((l) => l.replace(/^[•\-*\d+\.\)]\s?/, ''));
  return '<ul class="list-disc pl-5 space-y-1">' + items.map((li) => `<li>${li}</li>`).join('') + '</ul>';
};

/**
 * Hook up event listeners for toast notifications
 */
export const hookToastEvents = () => {
  // Alerts thresholds → toast
  document.addEventListener('sitsense:alert', (e) => {
    const { type, elapsed } = e.detail || {};
    const mm = Math.floor((elapsed || 0) / 60);
    if (type === 'hard') {
      showToast(`Sudah duduk ${mm} menit. Saatnya berdiri dan peregangan.`, 'warn');
    } else if (type === 'soft') {
      showToast(`Duduk ${mm} menit. Istirahat singkat sebentar ya.`, 'info');
    }
  });

  // Timer lifecycle
  document.addEventListener('sitsense:timer:start', () => showToast('Timer duduk dimulai', 'success'));
  document.addEventListener('sitsense:timer:stop', () => showToast('Timer dijeda', 'info'));
  document.addEventListener('sitsense:timer:reset', () => showToast('Timer direset', 'info'));

  // TTS lifecycle
  document.addEventListener('sitsense:tts:start', () => showToast('Membacakan rekomendasi…', 'info'));
  document.addEventListener('sitsense:tts:end', () => showToast('Selesai dibacakan', 'success'));
  document.addEventListener('sitsense:tts:error', () => showToast('Gagal memutar suara', 'error'));

  // Welcome hidden → cue small toast
  document.addEventListener('sitsense:welcome:hidden', () => showToast('Selamat datang di SitSense!', 'success'));
};

