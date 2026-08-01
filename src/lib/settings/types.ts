export interface EnterpriseSettings {
  sessionDurationLimit: number; // in hours
  ipWhitelist: string;
  dualAuthRequired: boolean;
  vaultEncryptionAlgo: string;
  autoBackupInterval: string;
}
