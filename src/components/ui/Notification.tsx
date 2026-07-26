'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface NotificationProps {
  title: string;
  description?: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  title,
  description,
  type = 'info',
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const typeStyles = {
    success: 'bg-success/5 border-success/20 text-success-foreground',
    warning: 'bg-warning/5 border-warning/20 text-warning-foreground',
    danger: 'bg-danger/5 border-danger/20 text-danger-foreground',
    info: 'bg-primary/5 border-primary/20 text-text-primary',
  };

  const iconMap = {
    success: <CheckCircle className="text-success h-5 w-5 shrink-0" />,
    warning: <AlertTriangle className="text-warning h-5 w-5 shrink-0" />,
    danger: <AlertCircle className="text-danger h-5 w-5 shrink-0" />,
    info: <Info className="text-primary h-5 w-5 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 select-none ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {iconMap[type]}
      <div className="flex flex-grow flex-col gap-0.5">
        <h4 className="text-text-primary text-sm leading-tight font-semibold">{title}</h4>
        {description && <p className="text-text-secondary text-xs leading-normal">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary hover:bg-foreground/5 cursor-pointer rounded-lg p-0.5 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Notification;
