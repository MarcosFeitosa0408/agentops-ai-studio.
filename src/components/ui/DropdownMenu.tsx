'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignClasses} border-border bg-surface animate-in fade-in slide-in-from-top-1 z-50 mt-2 w-56 origin-top-right rounded-xl border p-1 shadow-lg ring-1 ring-black/5 duration-100 focus:outline-none`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-0.5 py-1" role="none">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${item.disabled ? 'cursor-not-allowed opacity-40' : ''} ${
                  item.danger
                    ? 'text-danger hover:bg-danger/10 hover:text-danger'
                    : 'text-text-primary hover:bg-neutral-light'
                } `}
                role="menuitem"
              >
                {item.icon && <span className="text-text-muted shrink-0">{item.icon}</span>}
                <span className="flex-grow">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
