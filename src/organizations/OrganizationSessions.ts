export interface ActiveSession {
  id: string;
  userId: string;
  organizationId: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  trusted: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  status: 'Active' | 'Logged_Out' | 'Revoked';
}

export class OrganizationSessionsManager {
  private static instance: OrganizationSessionsManager;
  private STORAGE_KEY = 'agentops_active_sessions_v1';
  private inMemorySessions: Record<string, ActiveSession> = {};

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationSessionsManager {
    if (!OrganizationSessionsManager.instance) {
      OrganizationSessionsManager.instance = new OrganizationSessionsManager();
    }
    return OrganizationSessionsManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.inMemorySessions = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading active sessions:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemorySessions));
    } catch (e) {
      console.error('Error saving active sessions:', e);
    }
  }

  public createSession(params: {
    userId: string;
    organizationId: string;
    ipAddress: string;
    userAgent: string;
    deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
    sessionDurationHours?: number;
  }): ActiveSession {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const durationHours = params.sessionDurationHours || 24;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const newSession: ActiveSession = {
      id,
      userId: params.userId,
      organizationId: params.organizationId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceType: params.deviceType || 'Desktop',
      trusted: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt,
      status: 'Active',
    };

    this.inMemorySessions[id] = newSession;
    this.save();
    return newSession;
  }

  public getSession(id: string): ActiveSession | undefined {
    return this.inMemorySessions[id];
  }

  public listSessionsByOrg(orgId: string): ActiveSession[] {
    return Object.values(this.inMemorySessions).filter((s) => s.organizationId === orgId && s.status === 'Active');
  }

  public listSessionsByUser(userId: string): ActiveSession[] {
    return Object.values(this.inMemorySessions).filter((s) => s.userId === userId && s.status === 'Active');
  }

  public revokeSession(id: string): boolean {
    const session = this.inMemorySessions[id];
    if (session) {
      session.status = 'Revoked';
      this.save();
      return true;
    }
    return false;
  }

  public toggleTrustDevice(id: string, trusted: boolean): ActiveSession {
    const session = this.inMemorySessions[id];
    if (!session) {
      throw new Error('Session not found');
    }
    session.trusted = trusted;
    this.save();
    return session;
  }

  public refreshSession(id: string, sessionDurationHours?: number): ActiveSession {
    const session = this.inMemorySessions[id];
    if (!session) {
      throw new Error('Session not found');
    }
    if (session.status !== 'Active') {
      throw new Error(`Session is not active (status: ${session.status})`);
    }

    const now = new Date();
    if (new Date(session.expiresAt).getTime() < now.getTime()) {
      session.status = 'Revoked';
      this.save();
      throw new Error('Session has expired.');
    }

    const durationHours = sessionDurationHours || 24;
    session.lastActiveAt = now.toISOString();
    session.expiresAt = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString();
    this.save();
    return session;
  }

  public cleanExpiredSessions(): void {
    const now = Date.now();
    let updated = false;
    for (const id in this.inMemorySessions) {
      const session = this.inMemorySessions[id];
      if (session.status === 'Active' && new Date(session.expiresAt).getTime() < now) {
        session.status = 'Revoked';
        updated = true;
      }
    }
    if (updated) {
      this.save();
    }
  }

  public clearInMemory(): void {
    this.inMemorySessions = {};
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
