import { AuditService } from '../lib/audit/auditService';
import { AuditLogEntry } from '../lib/audit/types';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;
}

export interface SecurityPolicies {
  organizationId: string;
  passwordPolicy: PasswordPolicy;
  ipAllowList: string[]; // Allowed exact IPs or CIDR/patterns
  domainRestrictions: string[]; // Allowed domains for users (e.g., ["company.com"])
  sessionTimeoutMinutes: number;
  trustedNetworksOnly: boolean;
}

export class OrganizationAuditPoliciesManager {
  private static instance: OrganizationAuditPoliciesManager;
  private STORAGE_KEY = 'agentops_security_policies_v1';
  private inMemoryPolicies: Record<string, SecurityPolicies> = {};
  private inMemoryLogs: Record<string, AuditLogEntry[]> = {}; // Node-safe fallback tracker for testing

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationAuditPoliciesManager {
    if (!OrganizationAuditPoliciesManager.instance) {
      OrganizationAuditPoliciesManager.instance = new OrganizationAuditPoliciesManager();
    }
    return OrganizationAuditPoliciesManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.inMemoryPolicies = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading security policies:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemoryPolicies));
    } catch (e) {
      console.error('Error saving security policies:', e);
    }
  }

  public getPolicies(orgId: string): SecurityPolicies {
    if (!this.inMemoryPolicies[orgId]) {
      this.inMemoryPolicies[orgId] = {
        organizationId: orgId,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
        ipAllowList: [],
        domainRestrictions: [],
        sessionTimeoutMinutes: 60,
        trustedNetworksOnly: false,
      };
    }
    return this.inMemoryPolicies[orgId];
  }

  public savePolicies(policies: SecurityPolicies): void {
    this.inMemoryPolicies[policies.organizationId] = policies;
    this.save();
  }

  // Validates password against policy
  public validatePassword(orgId: string, password: string): void {
    const policies = this.getPolicies(orgId);
    const policy = policies.passwordPolicy;

    if (password.length < policy.minLength) {
      throw new Error(`A senha deve ter pelo menos ${policy.minLength} caracteres.`);
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      throw new Error('A senha deve conter pelo menos uma letra minúscula.');
    }
    if (policy.requireNumbers && !/\d/.test(password)) {
      throw new Error('A senha deve conter pelo menos um número.');
    }
    if (policy.requireSpecialCharacters && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.).');
    }
  }

  // Checks if user IP is whitelisted
  public checkIPAllowList(orgId: string, ipAddress: string): boolean {
    const policies = this.getPolicies(orgId);
    if (policies.ipAllowList.length === 0) {
      return true; // No restrictions
    }

    const cleanIp = ipAddress.trim();
    return policies.ipAllowList.some((allowedPattern) => {
      const pattern = allowedPattern.trim();
      if (pattern === cleanIp) return true;
      // Handle simple wildcard pattern, e.g. "192.168.1.*"
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return cleanIp.startsWith(prefix);
      }
      return false;
    });
  }

  // Checks if user email domain matches restrictions
  public checkDomainRestrictions(orgId: string, email: string): boolean {
    const policies = this.getPolicies(orgId);
    if (policies.domainRestrictions.length === 0) {
      return true; // No restrictions
    }

    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return false;

    return policies.domainRestrictions.some((allowedDomain) => {
      return domain === allowedDomain.toLowerCase().trim();
    });
  }

  // Log authentication actions and audits
  public logAuthAction(params: {
    userId: string;
    userName: string;
    action: string;
    description: string;
    organizationId: string;
  }): void {
    const entry = AuditService.createEntry(
      params.userId,
      params.userName,
      params.action,
      `[Org: ${params.organizationId}] ${params.description}`,
    );

    // Save entry in browser-safe compliance lists
    if (this.isBrowser()) {
      try {
        const key = `agentops_audit_logs_${params.organizationId}`;
        const stored = localStorage.getItem(key);
        const logs = stored ? JSON.parse(stored) : [];
        logs.unshift(entry);
        localStorage.setItem(key, JSON.stringify(logs.slice(0, 500))); // Keep last 500 logs
      } catch (e) {
        console.error('Error logging audit action locally:', e);
      }
    } else {
      if (!this.inMemoryLogs[params.organizationId]) {
        this.inMemoryLogs[params.organizationId] = [];
      }
      this.inMemoryLogs[params.organizationId].unshift(entry);
    }
  }

  public getLocalLogs(orgId: string): AuditLogEntry[] {
    if (!this.isBrowser()) {
      return this.inMemoryLogs[orgId] || [];
    }
    try {
      const key = `agentops_audit_logs_${orgId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public clearInMemory(): void {
    this.inMemoryPolicies = {};
    this.inMemoryLogs = {};
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
export default OrganizationAuditPoliciesManager;
