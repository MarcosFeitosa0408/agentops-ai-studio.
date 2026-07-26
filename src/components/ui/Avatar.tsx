'use client';

import React, { useState } from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback = 'A',
  size = 'md',
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Derived state adjustment if prop changes during render
  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  const initials = fallback
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`bg-border text-text-secondary relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-text-primary dark:text-text-secondary">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
