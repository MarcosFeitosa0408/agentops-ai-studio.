import { Organization } from './Organization';
import { DEFAULT_SETTINGS } from './OrganizationSettings';
import { PLAN_LIMITS } from './OrganizationPlans';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-default',
    name: 'Default Corp',
    logo: 'DC',
    plan: 'Enterprise',
    ownerId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'active',
    users: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    workers: [
      'worker-1',
      'worker-2',
      'worker-3',
      'worker-4',
      'worker-5',
      'worker-6',
      'worker-7',
      'worker-8',
      'worker-9',
      'worker-10',
      'worker-11',
      'worker-12',
      'worker-13',
      'worker-14',
      'worker-15',
    ],
    plugins: [
      'github-connector',
      'slack-connector',
      'gmail-connector',
      'notion-connector',
      'google-drive-connector',
      'postgresql-connector',
      'mysql-connector',
      'filesystem-connector',
    ],
    workflows: ['wf-1', 'wf-2', 'wf-3'],
    dashboards: ['db-finance', 'db-operations'],
    settings: { ...DEFAULT_SETTINGS, themeColor: '#6d28d9' },
    limits: PLAN_LIMITS.Enterprise,
  },
  {
    id: 'org-acme',
    name: 'Acme Analytics',
    logo: 'AA',
    plan: 'Pro',
    ownerId: 'user-2',
    createdAt: '2026-02-15T00:00:00.000Z',
    status: 'active',
    users: ['user-2', 'user-3'],
    workers: ['worker-1', 'worker-2'],
    plugins: ['slack-connector', 'notion-connector'],
    workflows: ['wf-2'],
    dashboards: ['db-marketing'],
    settings: { ...DEFAULT_SETTINGS, themeColor: '#3b82f6' },
    limits: PLAN_LIMITS.Pro,
  },
];

export class OrganizationRepository {
  private static STORAGE_KEY = 'agentops_organizations_v1';
  private static cache: Organization[] | null = null;

  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  static list(): Organization[] {
    if (this.cache) return this.cache;

    if (!this.isBrowser()) {
      this.cache = JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS));
      return this.cache!;
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
        return this.cache!;
      }
      this.saveAll(INITIAL_ORGANIZATIONS);
      this.cache = JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS));
      return this.cache!;
    } catch (e) {
      console.error('Error loading organizations:', e);
      this.cache = JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS));
      return this.cache!;
    }
  }

  static find(id: string): Organization | undefined {
    return this.list().find((org) => org.id === id);
  }

  static saveAll(orgs: Organization[]): void {
    this.cache = orgs;
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orgs));
    } catch (e) {
      console.error('Error saving organizations:', e);
    }
  }

  static create(org: Organization): Organization {
    const list = this.list();
    list.push(org);
    this.saveAll(list);
    return org;
  }

  static update(id: string, updates: Partial<Organization>): Organization {
    const list = this.list();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Organization ${id} not found`);
    }
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveAll(list);
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.list();
    const filtered = list.filter((o) => o.id !== id);
    if (filtered.length < list.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  static reset(): void {
    this.cache = JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS));
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
export default OrganizationRepository;
