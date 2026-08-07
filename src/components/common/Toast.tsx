import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 4000
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!message) return;

    setIsFadingOut(false);

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const handleManualClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-950/10 max-w-md transition-all duration-300 ${
        isFadingOut
          ? 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-3'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
      </div>
      <span className="text-xs sm:text-sm font-semibold leading-tight flex-1">
        {message}
      </span>
      <button
        type="button"
        onClick={handleManualClose}
        className="p-1 text-emerald-600 hover:text-emerald-950 hover:bg-emerald-100/80 rounded-md transition-colors cursor-pointer shrink-0 ml-1"
        title="Fechar notificação"
        aria-label="Fechar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
