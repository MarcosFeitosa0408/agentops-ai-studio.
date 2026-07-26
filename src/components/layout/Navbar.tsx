'use client';

import React from 'react';
import Link from 'next/link';

export interface NavbarLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  links: NavbarLink[];
}

export const Navbar: React.FC<NavbarProps> = ({ links }) => {
  return (
    <nav className="border-border bg-surface no-scrollbar flex h-12 items-center overflow-x-auto border-b px-6 select-none">
      <div className="flex gap-6">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`relative py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
              link.active ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            } `}
          >
            {link.label}
            {link.active && (
              <span className="bg-primary animate-in fade-in absolute bottom-0 left-0 h-0.5 w-full rounded-full duration-200" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
