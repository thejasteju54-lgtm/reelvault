import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastVariant } from '../../contexts/ToastContext';

interface ToastProps {
  title: string;
  message?: string;
  variant: ToastVariant;
  onClose: () => void;
}

export function Toast({ title, message, variant, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before the actual unmount in context
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3800); // 200ms before the 4000ms context unmount

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200); // Wait for exit animation
  };

  const Icon = variant === 'success' ? CheckCircle : variant === 'error' ? XCircle : Info;

  return (
    <div className={`toast toast-${variant} ${isExiting ? 'toast-exiting' : ''}`}>
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      <div className="toast-message">
        <div style={{ fontWeight: 600 }}>{title}</div>
        {message && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {message}
          </div>
        )}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close toast">
        <X size={16} />
      </button>
    </div>
  );
}
