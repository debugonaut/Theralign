import React, {
  createContext, useContext, useState, useCallback, useRef
} from 'react';
import { X } from 'lucide-react';

/**
 * Structured Warmth — Toast Notification System
 *
 * Placed in the bottom-right corner. Incorporates rounded-lg (12px), soft Slate
 * borders, shadow-dropdown, and brand semantic accents.
 */

const VARIANT_CONFIG = {
  success: { accentColor: '#0A7E6E', autoDismiss: true  },
  error:   { accentColor: '#C0392B', autoDismiss: false },
  info:    { accentColor: '#0B4F6C', autoDismiss: true  },
  warning: { accentColor: '#B45309', autoDismiss: true  },
};

const AUTO_DISMISS_MS = 4000;

/* ── Context ──────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ── Individual Toast ─────────────────────────────────────── */
const ToastItem = ({ id, variant, title, message, onDismiss }) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const [isLeaving, setIsLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(id), 150);
  }, [id, onDismiss]);

  // Auto-dismiss (except errors)
  React.useEffect(() => {
    if (!config.autoDismiss) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [config.autoDismiss, dismiss]);

  return (
    <div
      className="relative flex items-start gap-3 bg-white rounded-md shadow-level-2"
      style={{
        width: '320px',
        border: '1px solid #DDE3EA',
        borderLeft: `6px solid ${config.accentColor}`,
        padding: '16px 20px',
        animation: isLeaving
          ? 'swiss-slide-out 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
          : 'swiss-slide-in 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p
            className="font-bold text-neutral-900 normal-case"
            style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', marginBottom: message ? '4px' : '0' }}
          >
            {title}
          </p>
        )}
        {message && (
          <p
            className="text-neutral-500"
            style={{ fontSize: '14px', lineHeight: '20px', fontFamily: 'Inter, sans-serif' }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Dismiss X */}
      <button
        onClick={dismiss}
        className="text-neutral-300 hover:text-danger transition-colors duration-fast cursor-pointer bg-transparent border-0 p-0 flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

/* ── Toast Provider ───────────────────────────────────────── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ variant = 'info', title, message }) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, variant, title, message }]);
    return id;
  }, []);

  const toast = {
    success: (title, message) => addToast({ variant: 'success', title, message }),
    error:   (title, message) => addToast({ variant: 'error',   title, message }),
    info:    (title, message) => addToast({ variant: 'info',    title, message }),
    warning: (title, message) => addToast({ variant: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container — fixed bottom-right */}
      <div
        className="fixed flex flex-col gap-3"
        style={{ bottom: '24px', right: '24px', zIndex: '10000' }}
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            variant={t.variant}
            title={t.title}
            message={t.message}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* ── useToast hook ────────────────────────────────────────── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

export default ToastProvider;
