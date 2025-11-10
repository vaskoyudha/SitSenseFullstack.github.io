import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_SESSION_KEY = 'sitsense_welcome_seen';
const STORAGE_DISABLE_KEY = 'sitsense_welcome_disabled';

const WelcomeModal = ({ autoHideMs = 2200, onlyOncePerSession = true, chime = false }) => {
  const [visible, setVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if disabled or already seen
    const isDisabled = () => {
      try {
        return localStorage.getItem(STORAGE_DISABLE_KEY) === '1';
      } catch (_) {
        return false;
      }
    };

    const isSeen = () => {
      try {
        return sessionStorage.getItem(STORAGE_SESSION_KEY) === '1';
      } catch (_) {
        return false;
      }
    };

    if (isDisabled() || (onlyOncePerSession && isSeen())) {
      setShouldShow(false);
      return;
    }

    setShouldShow(true);
    setVisible(true);

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Auto-hide after duration
    if (Number.isFinite(autoHideMs) && autoHideMs > 0) {
      // Respect reduced motion preference
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const delay = reducedMotion ? Math.min(autoHideMs, 800) : autoHideMs;
      
      const timer = setTimeout(() => {
        handleClose();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoHideMs, onlyOncePerSession]);

  const playChime = async () => {
    if (!chime) return;
    const audio = document.getElementById('assistantChime');
    if (audio) {
      try {
        await audio.play();
      } catch (_) {
        // Autoplay might be blocked
      }
    }
  };

  const markSeen = () => {
    try {
      sessionStorage.setItem(STORAGE_SESSION_KEY, '1');
    } catch (_) {
      // Ignore
    }
  };

  const handleClose = async () => {
    markSeen();
    if (chime) await playChime();
    setVisible(false);
    document.body.style.overflow = '';
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  if (!shouldShow || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      aria-label="SitSense Welcome"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-2xl w-full mx-4 glassy-card card-border p-8 md:p-12">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/img/logo-sitsense.svg"
              alt="SitSense Logo"
              className="h-16 md:h-20 w-auto"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Selamat Datang di SitSense
          </h2>

          <p className="text-lg text-slate-300/90 leading-relaxed">
            Sistem monitoring postur duduk cerdas yang membantu Anda menjaga kesehatan dan produktivitas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleClose}
              className="btn btn-gradient-primary normal-case px-8"
              data-action="close-welcome"
            >
              Mulai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

