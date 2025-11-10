/*
  SitSense — welcome.js
  Mengatur tampilan splash "Welcome" agar:
  - Auto-hide setelah durasi tertentu
  - Hanya muncul sekali per sesi (sessionStorage)
  - Bisa di-nonaktifkan permanen via localStorage (untuk future settings)
  - Memutar chime (opsional) ketika ditutup/dibuka
  - Menyediakan API global: window.SitSenseWelcome
*/
(function () {
  const STORAGE_SESSION_KEY = 'sitsense_welcome_seen';
  const STORAGE_DISABLE_KEY = 'sitsense_welcome_disabled';
  const SELECTOR = '[aria-label="SitSense Welcome"]';

  function q() { return document.querySelector(SELECTOR); }
  function markSeen() { try { sessionStorage.setItem(STORAGE_SESSION_KEY, '1'); } catch (_) {} }
  function isSeen() { try { return sessionStorage.getItem(STORAGE_SESSION_KEY) === '1'; } catch (_) { return false; } }
  function isDisabled() { try { return localStorage.getItem(STORAGE_DISABLE_KEY) === '1'; } catch (_) { return false; } }
  function setDisabled(flag) { try { localStorage.setItem(STORAGE_DISABLE_KEY, flag ? '1' : '0'); } catch (_) {} }

  function hide(el) {
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = _overflowRestore || '';
    document.dispatchEvent(new CustomEvent('sitsense:welcome:hidden'));
  }
  function show(el) {
    if (!el) return;
    el.style.display = 'flex';
    el.removeAttribute('aria-hidden');
    document.dispatchEvent(new CustomEvent('sitsense:welcome:shown'));
  }

  async function playChime() {
    const el = document.getElementById('assistantChime');
    if (!el) return;
    try { await el.play(); } catch (_) { /* autoplay might be blocked until user gesture */ }
  }

  let _overflowRestore = '';
  function init(opts) {
    const options = Object.assign({ autoHideMs: 2200, onlyOncePerSession: true, chime: false }, opts || {});
    const splash = q();
    if (!splash) return;

    // Allow overriding via data-autohide-ms on splash container
    const dataMs = parseInt(splash.getAttribute('data-autohide-ms'), 10);
    if (Number.isFinite(dataMs) && dataMs > 0) options.autoHideMs = dataMs;

    // Respect user motion preference: shorten or remove animation if reduced
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      options.autoHideMs = Math.min(options.autoHideMs, 800);
    }

    if (isDisabled() || (options.onlyOncePerSession && isSeen())) {
      hide(splash);
      return;
    }

    // Prevent background scroll while splash visible
    _overflowRestore = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';

    // Close helpers
    const close = async () => {
      markSeen();
      if (options.chime) await playChime();
      hide(splash);
    };

    // Button action: try find explicit [data-action="close-welcome"], else fallback .btn-primary in splash
    const closeBtn = splash.querySelector('[data-action="close-welcome"], .btn.btn-primary');
    if (closeBtn) closeBtn.addEventListener('click', () => close(), { once: true });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && splash.style.display !== 'none') close();
    });

    // Auto-hide after duration
    if (Number.isFinite(options.autoHideMs) && options.autoHideMs > 0) {
      setTimeout(() => close(), options.autoHideMs);
    }

    show(splash);
  }

  // Public API
  window.SitSenseWelcome = {
    init,
    show: () => show(q()),
    hide: () => hide(q()),
    reset: () => { try { sessionStorage.removeItem(STORAGE_SESSION_KEY); } catch (_) {} show(q()); },
    seen: () => isSeen(),
    disable: (flag = true) => setDisabled(flag),
    enable: () => setDisabled(false)
  };

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.SitSenseWelcome.init({ autoHideMs: 2200, onlyOncePerSession: true, chime: false });
  });
})();
