'use client';

import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} bg-neutral-dark animate-in fade-in zoom-in-95 pointer-events-none z-50 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-sm duration-100 select-none`}
          role="tooltip"
        >
          {content}
          <div
            className={`bg-neutral-dark absolute h-1.5 w-1.5 rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -mt-1 -translate-x-1/2'
                : position === 'bottom'
                  ? 'bottom-full left-1/2 -mb-1 -translate-x-1/2'
                  : position === 'left'
                    ? 'top-1/2 left-full -ml-1 -translate-y-1/2'
                    : 'top-1/2 right-full -mr-1 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
