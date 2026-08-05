import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AgentProvider } from '@/context/AgentContext';
import { AIConfigProvider } from '../lib/ai/hooks/useAIConfig';
import { AuthProvider } from '@/context/AuthContext';
import { OrganizationProvider } from '@/context/OrganizationContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { AuditProvider } from '@/context/AuditContext';
import { SettingsProvider } from '@/context/SettingsContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AgentOps AI Studio',
  description:
    'Enterprise AI Agent Platform for Data Analysis, Automation and Business Intelligence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <ThemeProvider>
          <ToastProvider>
            <AIConfigProvider>
              <AgentProvider>
                <AuthProvider>
                  <OrganizationProvider>
                    <WorkspaceProvider>
                      <AuditProvider>
                        <SettingsProvider>
                          {children}
                        </SettingsProvider>
                      </AuditProvider>
                    </WorkspaceProvider>
                  </OrganizationProvider>
                </AuthProvider>
              </AgentProvider>
            </AIConfigProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
