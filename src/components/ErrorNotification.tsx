import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorNotificationProps {
  error: string | null;
  onClose: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-300 mb-1">Error</h4>
            <p className="text-sm text-red-200">{error}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};