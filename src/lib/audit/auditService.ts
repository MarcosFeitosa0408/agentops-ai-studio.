import { AuditLogEntry } from './types';

export class AuditService {
  // Simple deterministic string hashing simulating SHA-256 for compliance verification
  static generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_${hex}f5d8e7a2b9c3c1d0e5f9a8b7c6d5e4f3a2b1`;
  }

  static createEntry(
    userId: string,
    userName: string,
    action: string,
    description: string,
    workspaceId?: string,
  ): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const ip = '127.0.0.1 (VPN Local)';
    const rawContent = `${id}|${userId}|${userName}|${action}|${description}|${workspaceId}|${timestamp}|${ip}`;
    const hash = this.generateHash(rawContent);

    return {
      id,
      userId,
      userName,
      action,
      description,
      workspaceId,
      ip,
      timestamp,
      hash,
    };
  }
}
export default AuditService;
