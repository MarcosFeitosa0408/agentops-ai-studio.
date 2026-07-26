import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  clean = false,
  ...props
}) => {
  return (
    <div
      className={`${clean ? '' : 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
