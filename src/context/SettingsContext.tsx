'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnterpriseSettings } from '../lib/settings/types';
import { DEFAULT_SETTINGS } from '../lib/settings/settingsService';

interface SettingsContextType {
  settings: EnterpriseSettings;
  updateSettings: (newSettings: Partial<EnterpriseSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EnterpriseSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedSettings = localStorage.getItem('s8_settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (e) {
        console.error('Error hydrating enterprise settings:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateSettings = (newSettings: Partial<EnterpriseSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('s8_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
export default SettingsContext;
