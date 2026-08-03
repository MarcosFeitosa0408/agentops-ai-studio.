import { EnterpriseSettings } from './types';

export const DEFAULT_SETTINGS: EnterpriseSettings = {
  sessionDurationLimit: 4,
  ipWhitelist: '127.0.0.1, 192.168.0.0/16',
  dualAuthRequired: false,
  vaultEncryptionAlgo: 'AES-256-GCM',
  autoBackupInterval: 'Diário (00:00 UTC)',
};
