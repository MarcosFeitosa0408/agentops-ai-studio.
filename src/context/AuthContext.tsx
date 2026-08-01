'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../lib/auth/types';
import { AuthService } from '../lib/auth/authService';

interface AuthContextType {
  currentUser: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  useEffect(() => {
    // Hydrate state from localStorage safely and asynchronously
    const timer = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('s8_user');
        const storedToken = localStorage.getItem('s8_token');
        if (storedUser && storedToken) {
          setCurrentUser(JSON.parse(storedUser));
          setSessionToken(storedToken);
        }
      } catch (e) {
        console.error('Error hydrating auth state:', e);
      } finally {
        setIsAuthenticating(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsAuthenticating(true);
    // Simulate API network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user = AuthService.login(email);
    if (user) {
      const token = AuthService.generateToken(user);
      setCurrentUser(user);
      setSessionToken(token);
      localStorage.setItem('s8_user', JSON.stringify(user));
      localStorage.setItem('s8_token', token);
      setIsAuthenticating(false);
      return true;
    }
    setIsAuthenticating(false);
    return false;
  };

  const register = async (name: string, email: string, role: UserRole): Promise<boolean> => {
    setIsAuthenticating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user = AuthService.register(name, email, role);
    const token = AuthService.generateToken(user);
    setCurrentUser(user);
    setSessionToken(token);
    localStorage.setItem('s8_user', JSON.stringify(user));
    localStorage.setItem('s8_token', token);
    setIsAuthenticating(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionToken(null);
    localStorage.removeItem('s8_user');
    localStorage.removeItem('s8_token');
  };

  const refreshSession = async () => {
    if (!currentUser) return;
    setIsAuthenticating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const token = AuthService.generateToken(currentUser);
    setSessionToken(token);
    localStorage.setItem('s8_token', token);
    setIsAuthenticating(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        sessionToken,
        isAuthenticated: !!currentUser,
        isAuthenticating,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthContext;
