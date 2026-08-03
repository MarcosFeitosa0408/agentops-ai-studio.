'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface RouteProtectionProps {
  children: ReactNode;
}

export function RouteProtection({ children }: RouteProtectionProps) {
  const { currentUser, isAuthenticating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticating && !currentUser) {
      // Don't redirect if we are already on login or register
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [currentUser, isAuthenticating, router, pathname]);

  if (isAuthenticating) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Autenticando sessão corporativa...</p>
      </div>
    );
  }

  // If not logged in and not on login/register, don't show the content (prevents flash of guarded page)
  if (!currentUser && pathname !== '/login' && pathname !== '/register') {
    return (
      <div className="flex h-screen w-screen bg-slate-900" />
    );
  }

  return <>{children}</>;
}

export default RouteProtection;
