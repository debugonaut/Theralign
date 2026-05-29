import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * D1.8 — Modal Primitive Component
 *
 * Used for: booking confirmation, rejection reason entry, cancellation,
 * and any other overlay interaction across the entire product.
 *
 * Rules:
 *   - Dark semi-transparent black overlay — NO blur whatsoever
 *     (backdrop-blur implies glassmorphism, antithetical to Swiss flatness)
 *   - 2px black border, zero border-radius, no shadow
 *   - Header: 4px bottom rule separating from content
 *   - X close button: shifts to red on hover
 *   - Click on overlay (not the modal container) calls onClose
 *   - Fixed width — content scrolls inside, modal does not resize
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
  children,
  footer,
}) => {
  const modalRef = useRef(null);

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
    // Only close when clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}  // NO blur — dark overlay only
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-swiss-white flex flex-col"
        style={{
          width: SIZE_WIDTHS[size] || SIZE_WIDTHS.md,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '80vh',
          border: '2px solid #0F0F0F',   // 2px structural border
          borderRadius: '0',             // Absolutely no rounded corners
          boxShadow: 'none',             // No drop shadow — ever
        }}
        onClick={(e) => e.stopPropagation()}  // Prevent overlay click from firing
      >
        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '4px solid #0F0F0F' }}
        >
          <h2
            id="modal-title"
            className="font-bold uppercase tracking-wider text-swiss-black"
            style={{ fontSize: '18px', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}
          >
            {title}
          </h2>

          {/* Close button — X icon, hover shifts to swiss-red */}
          <button
            onClick={onClose}
            className="text-swiss-black hover:text-swiss-red transition-colors duration-fast cursor-pointer bg-transparent border-0 p-1 -mr-1"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ── Content (scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>

        {/* ── Footer (optional) ── */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-8 py-6"
            style={{ borderTop: '2px solid #E5E5E5' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
