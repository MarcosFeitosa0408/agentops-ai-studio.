import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  ...props
}) => {
  return (
    <section className={`py-6 md:py-10 ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="mb-6 flex flex-col justify-between gap-4 select-none md:flex-row md:items-center">
          <div className="space-y-1">
            {title && (
              <h2 className="text-text-primary text-xl font-bold tracking-tight md:text-2xl">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-text-muted text-sm">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;
