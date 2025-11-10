import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    info: {
      bg: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
      icon: Info,
    },
    success: {
      bg: 'linear-gradient(90deg, #10b981, #34d399)',
      icon: CheckCircle,
    },
    warn: {
      bg: 'linear-gradient(90deg, #f59e0b, #f97316)',
      icon: AlertTriangle,
    },
    error: {
      bg: 'linear-gradient(90deg, #ef4444, #f43f5e)',
      icon: AlertCircle,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md glassy-card card-border p-4 shadow-2xl transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ background: config.bg }}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-white text-sm">{message}</div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="btn btn-ghost btn-xs btn-circle text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type = 'info', duration = 3000 } = e.detail || {};
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    document.addEventListener('sitsense:toast', handleToast);
    return () => {
      document.removeEventListener('sitsense:toast', handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Utility function to show toast
export const showToast = (message, type = 'info', duration = 3000) => {
  document.dispatchEvent(
    new CustomEvent('sitsense:toast', {
      detail: { message, type, duration },
    })
  );
};

export default Toast;

