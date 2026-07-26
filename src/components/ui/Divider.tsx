import React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
  label,
}) => {
  if (orientation === 'vertical') {
    return <div className={`bg-border inline-block h-full w-[1px] self-stretch ${className}`} />;
  }

  return (
    <div className={`relative my-4 flex w-full items-center select-none ${className}`}>
      <div className="border-border/80 flex-grow border-t" />
      {label && (
        <span className="text-text-muted mx-4 shrink-0 text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      )}
      {label && <div className="border-border/80 flex-grow border-t" />}
    </div>
  );
};

export default Divider;
