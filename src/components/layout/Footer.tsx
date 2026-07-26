import React from 'react';
import { Shield } from 'lucide-react';
import { Container } from './Container';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-surface mt-auto border-t py-10 transition-colors duration-200 select-none md:py-14">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo / Copyright */}
          <div className="flex items-center gap-3">
            <div className="from-primary to-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr text-white shadow-sm">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-text-primary text-sm font-bold tracking-tight">
                AgentOps AI Studio
              </span>
              <span className="text-text-muted text-[10px] leading-tight">
                &copy; {currentYear} AgentOps AI Inc. All rights reserved.
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="#"
              className="text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              API Reference
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
