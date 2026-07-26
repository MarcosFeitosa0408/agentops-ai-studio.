'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, HelpCircle } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isConfirming?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isConfirming = false,
}) => {
  const icon =
    variant === 'danger' ? (
      <AlertCircle className="text-danger h-6 w-6 shrink-0" />
    ) : variant === 'warning' ? (
      <AlertCircle className="text-warning h-6 w-6 shrink-0" />
    ) : (
      <HelpCircle className="text-primary h-6 w-6 shrink-0" />
    );

  const confirmButtonVariant =
    variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex gap-4">
        {icon}
        <div className="flex flex-grow flex-col gap-1.5">
          <h3 className="text-text-primary text-lg leading-tight font-semibold">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="border-border/40 mt-6 flex justify-end gap-3 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isConfirming}>
          {cancelText}
        </Button>
        <Button
          variant={confirmButtonVariant}
          size="sm"
          onClick={onConfirm}
          isLoading={isConfirming}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default Dialog;
