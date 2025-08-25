// components/Toast.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 4000, 
  onClose, 
  visible 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border-l-4 min-w-[320px] max-w-md transition-all duration-300 transform";
    
    const typeStyles = {
      success: "bg-green-50 border-green-500 text-green-800",
      error: "bg-red-50 border-red-500 text-red-800", 
      warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
      info: "bg-blue-50 border-blue-500 text-blue-800"
    };

    const animationStyles = isExiting 
      ? "translate-x-full opacity-0" 
      : "translate-x-0 opacity-100";

    return `${baseStyles} ${typeStyles[type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 mr-3 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 mr-3 flex-shrink-0 text-green-600" />;
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-600" />;
      case 'info':
        return <AlertCircle {...iconProps} className="w-5 h-5 mr-3 flex-shrink-0 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, visible: true }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer
  };
};

export default Toast;
