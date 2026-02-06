import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * کامپوننت Dialog - مودال حرفه‌ای و قابل استفاده مجدد
 * 
 * @param {boolean} isOpen - وضعیت باز/بسته بودن مودال
 * @param {function} onClose - تابع برای بستن مودال
 * @param {string} title - عنوان مودال
 * @param {ReactNode} children - محتوای مودال
 * @param {string} size - اندازه مودال: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} closeOnOverlay - بستن مودال با کلیک روی overlay (پیش‌فرض: true)
 * @param {boolean} closeOnEsc - بستن مودال با کلید ESC (پیش‌فرض: true)
 * @param {boolean} showCloseButton - نمایش دکمه بستن (پیش‌فرض: true)
 * @param {ReactNode} footer - محتوای footer (اختیاری)
 * @param {string} className - کلاس‌های اضافی برای محتوای مودال
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = '',
}) => {
  const dialogRef = useRef(null);

  // تنظیم اندازه مودال
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4',
  };

  // جلوگیری از اسکرول صفحه وقتی مودال باز است
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // بستن مودال با کلید ESC
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  // Focus trap - نگه داشتن focus داخل مودال
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // کلیک روی overlay
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={`
          bg-white rounded-xl shadow-2xl w-full
          ${sizeClasses[size]}
          max-h-[90vh] overflow-hidden
          flex flex-col
          transform transition-all duration-300
          animate-fadeIn
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              id="dialog-title"
              className="text-xl font-bold text-gray-800"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== کامپوننت‌های کمکی ====================

/**
 * DialogHeader - هدر سفارشی برای مودال
 */
export const DialogHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

/**
 * DialogTitle - عنوان داخل بدنه مودال
 */
export const DialogTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

/**
 * DialogDescription - توضیحات داخل مودال
 */
export const DialogDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

/**
 * DialogFooter - فوتر سفارشی
 */
export const DialogFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

/**
 * ConfirmDialog - مودال تایید (برای حذف، خروج و...)
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تایید عملیات',
  message = 'آیا از انجام این عملیات اطمینان دارید؟',
  confirmText = 'تایید',
  cancelText = 'لغو',
  variant = 'danger', // 'danger', 'warning', 'info'
  isLoading = false,
}) => {
  const variantClasses = {
    danger: 'btn-danger',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'btn-primary',
  };

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlay={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <DialogFooter>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`btn ${variantClasses[variant]}`}
          >
            {isLoading ? (
              <>
                <span className="spinner spinner-sm"></span>
                در حال پردازش...
              </>
            ) : (
              confirmText
            )}
          </button>
        </DialogFooter>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Dialog>
  );
};

/**
 * AlertDialog - مودال اعلان (فقط یک دکمه OK)
 */
export const AlertDialog = ({
  isOpen,
  onClose,
  title = 'اعلان',
  message,
  buttonText = 'متوجه شدم',
  variant = 'info', // 'success', 'warning', 'danger', 'info'
}) => {
  const variantIcons = {
    success: '✓',
    warning: '⚠',
    danger: '✕',
    info: 'ℹ',
  };

  const variantColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <DialogFooter>
          <button onClick={onClose} className="btn btn-primary w-full">
            {buttonText}
          </button>
        </DialogFooter>
      }
    >
      <div className="text-center">
        <div
          className={`
            mx-auto mb-4 w-12 h-12 rounded-full
            flex items-center justify-center
            text-2xl font-bold
            ${variantColors[variant]}
            bg-${variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'danger' ? 'red' : 'blue'}-100
          `}
        >
          {variantIcons[variant]}
        </div>
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <p className="text-gray-700">{message}</p>
      </div>
    </Dialog>
  );
};

export default Dialog;
