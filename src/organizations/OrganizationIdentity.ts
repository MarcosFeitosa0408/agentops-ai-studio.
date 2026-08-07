export interface OrganizationIdentityProfile {
  id: string; // memberId or profileId
  userId: string;
  organizationId: string;
  employeeId?: string;
  department?: string;
  title?: string;
  domainVerified: boolean;
  status: 'Active' | 'Suspended' | 'Pending_Verification';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class OrganizationIdentityManager {
  private static instance: OrganizationIdentityManager;
  private STORAGE_KEY = 'agentops_identity_profiles_v1';
  private inMemoryProfiles: Record<string, OrganizationIdentityProfile> = {};

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationIdentityManager {
    if (!OrganizationIdentityManager.instance) {
      OrganizationIdentityManager.instance = new OrganizationIdentityManager();
    }
    return OrganizationIdentityManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.inMemoryProfiles = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading identity profiles:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemoryProfiles));
    } catch (e) {
      console.error('Error saving identity profiles:', e);
    }
  }

  public getProfile(userId: string, orgId: string): OrganizationIdentityProfile | undefined {
    const key = `${orgId}:${userId}`;
    return this.inMemoryProfiles[key];
  }

  public listProfilesByOrg(orgId: string): OrganizationIdentityProfile[] {
    return Object.values(this.inMemoryProfiles).filter((p) => p.organizationId === orgId);
  }

  public upsertProfile(profile: Partial<OrganizationIdentityProfile> & { userId: string; organizationId: string }): OrganizationIdentityProfile {
    const key = `${profile.organizationId}:${profile.userId}`;
    const existing = this.inMemoryProfiles[key] || {
      id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId: profile.userId,
      organizationId: profile.organizationId,
      domainVerified: false,
      status: 'Pending_Verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated: OrganizationIdentityProfile = {
      ...existing,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryProfiles[key] = updated;
    this.save();
    return updated;
  }

  public deleteProfile(userId: string, orgId: string): boolean {
    const key = `${orgId}:${userId}`;
    if (this.inMemoryProfiles[key]) {
      delete this.inMemoryProfiles[key];
      this.save();
      return true;
    }
    return false;
  }

  public clearInMemory(): void {
    this.inMemoryProfiles = {};
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
