export interface EnterpriseApiKey {
  id: string;
  name: string;
  key: string; // The raw secret key (displayed only once upon creation)
  maskedKey: string; // e.g. "ao_key_test_...abcd"
  userId: string;
  organizationId: string;
  scopes: string[]; // e.g., ['read:workers', 'write:workflows']
  createdAt: string;
  expiresAt?: string; // ISO String
  lastUsedAt?: string; // ISO String
  status: 'Active' | 'Revoked' | 'Expired';
  rateLimitPerMinute: number;
}

export class OrganizationApiKeysManager {
  private static instance: OrganizationApiKeysManager;
  private STORAGE_KEY = 'agentops_api_keys_v1';
  private inMemoryKeys: Record<string, EnterpriseApiKey> = {};

  private constructor() {
    this.load();
  }

  public static getInstance(): OrganizationApiKeysManager {
    if (!OrganizationApiKeysManager.instance) {
      OrganizationApiKeysManager.instance = new OrganizationApiKeysManager();
    }
    return OrganizationApiKeysManager.instance;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private load(): void {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.inMemoryKeys = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading API keys:', e);
    }
  }

  private save(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inMemoryKeys));
    } catch (e) {
      console.error('Error saving API keys:', e);
    }
  }

  public createKey(params: {
    name: string;
    userId: string;
    organizationId: string;
    scopes: string[];
    expiresInDays?: number;
    isPat?: boolean;
    rateLimit?: number;
  }): EnterpriseApiKey {
    const id = `key-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const prefix = params.isPat ? 'ao_pat' : 'ao_key';
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const key = `${prefix}_${randomPart}`;
    const maskedKey = `${prefix}_${randomPart.substring(0, 4)}...${randomPart.substring(randomPart.length - 4)}`;

    let expiresAt: string | undefined;
    if (params.expiresInDays) {
      expiresAt = new Date(Date.now() + params.expiresInDays * 24 * 3600 * 1000).toISOString();
    }

    const newKey: EnterpriseApiKey = {
      id,
      name: params.name,
      key,
      maskedKey,
      userId: params.userId,
      organizationId: params.organizationId,
      scopes: params.scopes,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: 'Active',
      rateLimitPerMinute: params.rateLimit || 120,
    };

    this.inMemoryKeys[id] = newKey;
    this.save();
    return newKey;
  }

  public listKeysByOrg(orgId: string): EnterpriseApiKey[] {
    return Object.values(this.inMemoryKeys).filter((k) => k.organizationId === orgId);
  }

  public listKeysByUser(userId: string): EnterpriseApiKey[] {
    return Object.values(this.inMemoryKeys).filter((k) => k.userId === userId);
  }

  public findByKey(key: string): EnterpriseApiKey | undefined {
    return Object.values(this.inMemoryKeys).find((k) => k.key === key);
  }

  public validateKey(key: string): EnterpriseApiKey {
    const apiKey = this.findByKey(key);
    if (!apiKey) {
      throw new Error('Invalid API Key / PAT: Key not found.');
    }

    if (apiKey.status === 'Revoked') {
      throw new Error('API Key has been revoked.');
    }

    if (apiKey.status === 'Expired' || (apiKey.expiresAt && new Date(apiKey.expiresAt).getTime() < Date.now())) {
      if (apiKey.status !== 'Expired') {
        apiKey.status = 'Expired';
        this.inMemoryKeys[apiKey.id] = apiKey;
        this.save();
      }
      throw new Error('API Key has expired.');
    }

    // Update last used at timestamp
    apiKey.lastUsedAt = new Date().toISOString();
    this.inMemoryKeys[apiKey.id] = apiKey;
    this.save();

    return apiKey;
  }

  public revokeKey(id: string): boolean {
    const apiKey = this.inMemoryKeys[id];
    if (apiKey) {
      apiKey.status = 'Revoked';
      this.save();
      return true;
    }
    return false;
  }

  public clearInMemory(): void {
    this.inMemoryKeys = {};
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
