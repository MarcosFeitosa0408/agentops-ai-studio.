export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  workspaceId?: string;
  ip: string;
  timestamp: string;
  hash: string; // Simulated SHA-256 tamper-proof hash of the entry contents
}
