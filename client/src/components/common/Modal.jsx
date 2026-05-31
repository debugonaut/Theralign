import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Structured Warmth — Modal Primitive Component
 *
 * Features:
 *   - Opening/Closing smooth 200ms cubic-bezier transition (rise from center).
 *   - Keyboard focus trap & autofocus of first input.
 *   - Full-screen viewport collapse below 640px with fixed header/footer and scrollable body.
 *   - Confirm state cross-fade support for inline notifications.
 */

const SIZE_WIDTHS = {
  sm: '400px',
  md: '560px',
  lg: '720px',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  isConfirmed = false,
  confirmContent = null,
  children,
  footer,
}) => {
  const modalRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  // Sync animations with open state
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimate(true), 20);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Find all focusable elements inside the modal
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalRef.current.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length > 0) {
      // Focus the first focusable element (e.g. first input or action button)
      focusableElements[0].focus();
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      const elements = modalRef.current.querySelectorAll(focusableSelectors);
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab -> Wrap to end
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab -> Wrap to start
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, isConfirmed]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-opacity duration-200 ease-swiss ${
        animate ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(28, 43, 58, 0.6)' }} // deep warmer tint overlay
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`relative bg-white flex flex-col w-full h-full sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-xl shadow-level-3 border-0 sm:border border-neutral-200 transition-all duration-200 ease-swiss ${
          animate ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.98]'
        }`}
        style={{
          width: SIZE_WIDTHS[size] || SIZE_WIDTHS.md,
          maxWidth: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (Fixed) ── */}
        <div
          className="shrink-0 relative flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-neutral-200"
        >
          <h2
            id="modal-title"
            className="font-bold text-neutral-900 leading-normal text-ui-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-danger transition-colors duration-fast cursor-pointer bg-transparent border-0 p-1 -mr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2 rounded"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ── Content & Confirmation (Cross-Faded, Scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 min-h-0 relative">
          <div
            className={`transition-all duration-200 ease-swiss ${
              isConfirmed && confirmContent 
                ? 'opacity-0 pointer-events-none absolute inset-0 p-6 sm:p-8' 
                : 'opacity-100'
            }`}
          >
            {children}
          </div>
          
          {confirmContent && (
            <div
              className={`transition-all duration-200 ease-swiss ${
                isConfirmed 
                  ? 'opacity-100' 
                  : 'opacity-0 pointer-events-none absolute inset-0 p-6 sm:p-8'
              }`}
            >
              {confirmContent}
            </div>
          )}
        </div>

        {/* ── Footer (Fixed, Hidden in confirmed state if confirmation handles its own action) ── */}
        {footer && !isConfirmed && (
          <div
            className="shrink-0 flex items-center justify-end gap-3 px-6 sm:px-8 py-5 sm:py-6 border-t border-neutral-200 bg-neutral-50 sm:bg-white"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
