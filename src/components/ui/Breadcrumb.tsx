'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="text-text-muted h-4 w-4" />,
  showHome = true,
}) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {showHome && (
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="text-text-secondary hover:text-primary inline-flex items-center text-sm font-medium transition-colors"
            >
              <Home className="mr-1.5 h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center space-x-1 md:space-x-2">
              <span className="flex shrink-0 items-center">{separator}</span>
              {isLast ? (
                <span
                  className="text-text-primary text-sm font-medium select-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-text-secondary hover:text-primary inline-flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="text-text-secondary inline-flex items-center gap-1 text-sm font-medium select-none">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
