import { describe, it, expect, beforeEach } from 'vitest';
import { OrganizationRepository } from '@/organizations/OrganizationRepository';
import { OrganizationManager } from '@/organizations/OrganizationManager';
import { OrganizationIsolation } from '@/organizations/OrganizationIsolation';
import { WorkerManager } from '@/workforce/WorkerManager';
import { PluginRegistry } from '@/lib/mcp/registry/PluginRegistry';
import { WorkflowEngine } from '@/lib/workflows/engine/WorkflowEngine';
import { ChunkIndexer } from '@/lib/rag/indexers/ChunkIndexer';
import { MemoryStorage } from '@/lib/memory/storage/MemoryStorage';
import { MonitoringService } from '@/lib/observability/MonitoringService';
import { AuditService } from '@/lib/audit/auditService';

describe('Enterprise Organizations & Multi-Tenant Unit Tests', () => {
  beforeEach(() => {
    OrganizationRepository.reset();
    OrganizationManager.getInstance().switchOrganization('org-default');
    MemoryStorage.getInstance().clear();
    ChunkIndexer.getInstance().clearAll();
  });

  describe('Organization Repository & Management CRUD', () => {
    it('should list pre-seeded initial organizations correctly', () => {
      const list = OrganizationRepository.list();
      expect(list.length).toBeGreaterThanOrEqual(2);

      const defaultCorp = list.find((o) => o.id === 'org-default');
      const acme = list.find((o) => o.id === 'org-acme');

      expect(defaultCorp).toBeDefined();
      expect(defaultCorp?.name).toBe('Default Corp');
      expect(defaultCorp?.plan).toBe('Enterprise');

      expect(acme).toBeDefined();
      expect(acme?.name).toBe('Acme Analytics');
      expect(acme?.plan).toBe('Pro');
    });

    it('should support creating a new custom organization with default settings and limits', () => {
      const initialCount = OrganizationRepository.list().length;
      OrganizationRepository.create({
        id: 'org-test-health',
        name: 'Health Care IA',
        logo: 'HC',
        plan: 'Starter',
        ownerId: 'user-1',
        createdAt: new Date().toISOString(),
        status: 'active',
        users: ['user-1'],
        workers: [],
        plugins: [],
        workflows: [],
        dashboards: [],
        settings: {
          themeColor: '#10b981',
          allowedLLMs: ['GPT-4o Advanced'],
          requireMFA: true,
          sessionTimeoutMinutes: 60,
          ipWhitelist: [],
          allowedPluginCategories: ['Healthcare'],
          enableAuditLogSymmetricEncryption: true,
        },
        limits: {
          maxUsers: 5,
          maxWorkers: 3,
          maxPlugins: 2,
          maxWorkflows: 3,
          maxMemoryUsageBytes: 5 * 1024 * 1024,
          maxDashboards: 1,
        },
      });

      expect(OrganizationRepository.list().length).toBe(initialCount + 1);
      const found = OrganizationRepository.find('org-test-health');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Health Care IA');
      expect(found?.plan).toBe('Starter');
      expect(found?.limits.maxWorkers).toBe(3);
    });

    it('should support updating organization details dynamically', () => {
      OrganizationRepository.update('org-acme', { name: 'Acme Enterprise BI' });
      const found = OrganizationRepository.find('org-acme');
      expect(found?.name).toBe('Acme Enterprise BI');
    });

    it('should support deactivating an organization without deleting it', () => {
      OrganizationRepository.update('org-acme', { status: 'inactive' });
      const found = OrganizationRepository.find('org-acme');
      expect(found?.status).toBe('inactive');

      // Attempting to switch to an inactive org must fail
      expect(() => OrganizationManager.getInstance().switchOrganization('org-acme')).toThrow();
    });

    it('should support deleting an organization safely, switching back if active', () => {
      const activeIdBefore = OrganizationManager.getInstance().getActiveOrgId();
      expect(activeIdBefore).toBe('org-default');

      // Create a test org, switch to it, and delete it
      OrganizationRepository.create({
        id: 'org-temp',
        name: 'Temp Org',
        logo: 'TO',
        plan: 'Starter',
        ownerId: 'user-1',
        createdAt: new Date().toISOString(),
        status: 'active',
        users: ['user-1'],
        workers: [],
        plugins: [],
        workflows: [],
        dashboards: [],
        settings: {
          themeColor: '#000',
          allowedLLMs: [],
          requireMFA: false,
          sessionTimeoutMinutes: 30,
          ipWhitelist: [],
          allowedPluginCategories: [],
          enableAuditLogSymmetricEncryption: false,
        },
        limits: {
          maxUsers: 2,
          maxWorkers: 2,
          maxPlugins: 2,
          maxWorkflows: 2,
          maxMemoryUsageBytes: 1024,
          maxDashboards: 1,
        },
      });

      OrganizationManager.getInstance().switchOrganization('org-temp');
      expect(OrganizationManager.getInstance().getActiveOrgId()).toBe('org-temp');

      const success = OrganizationRepository.delete('org-temp');
      expect(success).toBe(true);
      expect(OrganizationRepository.find('org-temp')).toBeUndefined();

      // Must automatically fallback to default
      expect(OrganizationManager.getInstance().getActiveOrgId()).toBe('org-default');
    });
  });

  describe('Active Tenant Switcher & Persistence', () => {
    it('should switch active organization and persist selection', () => {
      const manager = OrganizationManager.getInstance();
      expect(manager.getActiveOrgId()).toBe('org-default');

      manager.switchOrganization('org-acme');
      expect(manager.getActiveOrgId()).toBe('org-acme');
      expect(manager.getActiveOrganization().name).toBe('Acme Analytics');
    });
  });

  describe('Plan Limits Validation (Starter, Pro, Enterprise)', () => {
    it('should validate plan resource limits correctly', () => {
      const manager = OrganizationManager.getInstance();

      // Default Corp (Enterprise Plan)
      manager.switchOrganization('org-default');
      expect(manager.canAddUser()).toBe(true);
      expect(manager.canAddWorker()).toBe(true);
      expect(manager.canAddPlugin()).toBe(true);

      // Acme Analytics (Pro Plan, limits: maxWorkers=15, maxPlugins=8)
      manager.switchOrganization('org-acme');
      const orgAcme = manager.getActiveOrganization();
      expect(orgAcme.plan).toBe('Pro');
      expect(orgAcme.limits.maxWorkers).toBe(15);
      expect(orgAcme.limits.maxPlugins).toBe(8);

      // We can artificially fill up Acme workers list to verify plan blocking
      orgAcme.workers = Array.from({ length: 15 }, (_, i) => `w-${i}`);
      OrganizationRepository.update('org-acme', { workers: orgAcme.workers });

      expect(manager.canAddWorker()).toBe(false);
      expect(() => manager.associateWorker('new-test-worker')).toThrow('Plan limit reached');
    });
  });

  describe('Workers Isolation', () => {
    it('should isolate list of workers depending on the active tenant organization', () => {
      const workerManager = WorkerManager.getInstance();

      // Default Corp has all standard workers pre-installed
      OrganizationManager.getInstance().switchOrganization('org-default');
      const defaultWorkers = workerManager.list();
      expect(defaultWorkers.length).toBeGreaterThan(5);

      // Switch to Acme Analytics (which initially has worker-1, worker-2 only)
      OrganizationManager.getInstance().switchOrganization('org-acme');
      const acmeWorkers = workerManager.list();
      expect(acmeWorkers.length).toBe(2);
      expect(acmeWorkers.map((w) => w.id)).toContain('worker-1');
      expect(acmeWorkers.map((w) => w.id)).toContain('worker-2');
      expect(acmeWorkers.map((w) => w.id)).not.toContain('worker-5');

      // Create a custom worker under Acme Analytics
      const customWorker = workerManager.createCustom({
        name: 'Acme Sales Bot',
        description: 'Automação comercial para leads Acme',
        avatar: '🤖',
        category: 'Sales',
        permissions: ['workspace_write'],
        tools: [],
        capabilities: ['Vendas'],
        promptTemplate: 'Venda para: {task}',
        suggestedWorkflows: [],
        tags: ['sales'],
        instructions: 'Seja atencioso.',
        llm: 'GPT-4o Advanced',
        temperature: 0.5,
      });

      // Verify custom worker is visible inside Acme workers list
      const acmeWorkersUpdated = workerManager.list();
      expect(acmeWorkersUpdated.length).toBe(3);
      expect(acmeWorkersUpdated.map((w) => w.id)).toContain(customWorker.id);

      // Switch back to Default Corp: custom worker of Acme must NOT be visible!
      OrganizationManager.getInstance().switchOrganization('org-default');
      const defaultWorkersUpdated = workerManager.list();
      expect(defaultWorkersUpdated.map((w) => w.id)).not.toContain(customWorker.id);
    });
  });

  describe('Plugins Isolation', () => {
    it('should isolate list of standard and custom plugins depending on active tenant', () => {
      const registry = PluginRegistry.getInstance();

      // Default Corp has all plugins pre-registered
      OrganizationManager.getInstance().switchOrganization('org-default');
      const defaultPlugins = registry.list();
      expect(defaultPlugins.length).toBeGreaterThan(4);

      // Switch to Acme Analytics (slack-connector, notion-connector only)
      OrganizationManager.getInstance().switchOrganization('org-acme');
      const acmePlugins = registry.list();
      expect(acmePlugins.length).toBe(2);
      expect(acmePlugins.map((p) => p.manifest.id)).toContain('slack-connector');
      expect(acmePlugins.map((p) => p.manifest.id)).toContain('notion-connector');
      expect(acmePlugins.map((p) => p.manifest.id)).not.toContain('github-connector');

      // Registry.get of non-associated plugin must return undefined for Acme
      expect(registry.get('github-connector')).toBeUndefined();
    });
  });

  describe('Workflows Isolation', () => {
    it('should isolate workflow list and execution history per organization', () => {
      const engine = WorkflowEngine.getInstance();

      // Ensure we have standard mock workflows seeded in default corp list
      OrganizationManager.getInstance().switchOrganization('org-default');
      if (engine.list().length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (engine as any).workflows = [
          {
            id: 'wf-1',
            name: 'Análise de Vendas Automatizada',
            description: 'Flow 1',
            nodes: [],
            edges: [],
            triggers: [],
            variables: [],
            status: 'idle',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'wf-2',
            name: 'Marketing Acme',
            description: 'Flow 2',
            nodes: [],
            edges: [],
            triggers: [],
            variables: [],
            status: 'idle',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
      }

      const defaultWorkflows = engine.list();
      expect(defaultWorkflows.length).toBeGreaterThan(0);

      // Switch to Acme Analytics (wf-2 only initially)
      OrganizationManager.getInstance().switchOrganization('org-acme');
      const acmeWorkflows = engine.list();
      expect(acmeWorkflows.length).toBe(1);
      expect(acmeWorkflows[0].id).toBe('wf-2');

      // Create custom workflow under Acme
      const newWorkflow = engine.create({
        name: 'Acme Pipeline',
        description: 'Acme business flow',
        nodes: [],
        edges: [],
        triggers: [],
        variables: [],
      });

      expect(engine.list().length).toBe(2);
      expect(engine.find(newWorkflow.id)).toBeDefined();

      // Switch back to Default Corp
      OrganizationManager.getInstance().switchOrganization('org-default');
      expect(engine.find(newWorkflow.id)).toBeUndefined();
    });
  });

  describe('RAG Memory Storage Isolation', () => {
    it('should completely isolate cognitive memories and index files', () => {
      const storage = MemoryStorage.getInstance();
      const indexer = ChunkIndexer.getInstance();

      // Save memory and document under org-default
      OrganizationManager.getInstance().switchOrganization('org-default');
      storage.save({
        content: 'Default memory content.',
        scope: 'global',
        category: 'semantic_fact',
        metadata: { tags: ['default'] },
        type: 'long-term',
      });
      indexer.indexDocument({
        id: 'doc-default',
        name: 'default.pdf',
        type: 'PDF',
        sizeBytes: 100,
        createdAt: new Date().toISOString(),
        status: 'indexed',
        chunkCount: 1,
      }, []);

      const defaultMems = storage.list();
      expect(defaultMems.length).toBeGreaterThan(0);

      const defaultDocs = indexer.getDocuments();
      expect(defaultDocs.length).toBeGreaterThan(0);

      // Switch to Acme Analytics: must have no initial custom memories or custom RAG documents
      OrganizationManager.getInstance().switchOrganization('org-acme');
      expect(storage.list().length).toBe(0);
      expect(indexer.getDocuments().length).toBe(0);

      // Save memory under Acme
      storage.save({
        content: 'Acme secret formula: 42.',
        scope: 'global',
        category: 'semantic_fact',
        metadata: { tags: ['secret'] },
        type: 'long-term',
      });

      expect(storage.list().length).toBe(1);
      expect(storage.list()[0].content).toContain('Acme secret formula');

      // Switch to default: Acme memory must NOT leak
      OrganizationManager.getInstance().switchOrganization('org-default');
      const defaultMemsChecked = storage.list();
      expect(defaultMemsChecked.some((m) => m.content.includes('Acme secret formula'))).toBe(false);
    });
  });

  describe('Dashboards Metric Isolation', () => {
    it('should separate observatory dashboard monitoring storage key', () => {
      const mon = MonitoringService.getInstance();

      // Default Corp
      OrganizationManager.getInstance().switchOrganization('org-default');
      mon.clearMetrics();
      mon.recordDashboardView();
      mon.recordExecution(100);

      expect(mon.getMetrics().dashboardViews).toBe(1);
      expect(mon.getMetrics().totalLatencyMs).toBe(100);

      // Acme
      OrganizationManager.getInstance().switchOrganization('org-acme');
      mon.clearMetrics();
      mon.recordDashboardView();
      mon.recordDashboardView();
      mon.recordExecution(50);

      expect(mon.getMetrics().dashboardViews).toBe(2);
      expect(mon.getMetrics().totalLatencyMs).toBe(50);

      // Switch back to default and confirm metrics are isolated and intact
      OrganizationManager.getInstance().switchOrganization('org-default');
      expect(mon.getMetrics().dashboardViews).toBe(1);
      expect(mon.getMetrics().totalLatencyMs).toBe(100);
    });
  });

  describe('Audit Logs & Members Isolation', () => {
    it('should restrict visibility of audit compliance logs to members of active organization', () => {
      const mockLogEntry = AuditService.createEntry(
        'user-4',
        'Dev Core',
        'vault.reveal',
        'Visualizou segredo sensível de DevOps.',
      );

      // Save log
      const logs = [mockLogEntry];
      if (typeof window !== 'undefined') {
        localStorage.setItem('s8_audit_logs', JSON.stringify(logs));
      }

      // If active org is org-default: user-4 is a member, log is visible
      OrganizationManager.getInstance().switchOrganization('org-default');
      expect(OrganizationIsolation.isUserAllowed('user-4')).toBe(true);

      // If active org is org-acme: user-4 is NOT a member, log user is blocked
      OrganizationManager.getInstance().switchOrganization('org-acme');
      expect(OrganizationIsolation.isUserAllowed('user-4')).toBe(false);
    });
  });
});
