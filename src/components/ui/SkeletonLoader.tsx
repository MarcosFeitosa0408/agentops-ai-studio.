import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-border/80 dark:bg-border/40';

  const variantClasses = {
    text: 'h-3 w-full rounded-md',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="loading state"
    />
  );
};

export default SkeletonLoader;
