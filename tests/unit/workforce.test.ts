import { describe, it, expect, beforeEach } from 'vitest';
import { WorkerManager } from '@/workforce/WorkerManager';
import { executeWorkerTask } from '@/workforce/WorkerExecution';
import { WorkerScheduler } from '@/workforce/WorkerScheduler';

// Mock browser localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('AI Workforce Unit Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const manager = WorkerManager.getInstance();
    manager.resetHydration();
    manager.clearHistory();

    const scheduler = WorkerScheduler.getInstance();
    scheduler.resetHydration();
  });

  it('should load predefined workers successfully', () => {
    const manager = WorkerManager.getInstance();
    const list = manager.list();
    expect(list.length).toBeGreaterThan(0);

    const dataAnalyst = manager.find('worker-1');
    expect(dataAnalyst).toBeDefined();
    expect(dataAnalyst?.name).toBe('Data Analyst');
    expect(dataAnalyst?.category).toBe('Analytics');
    expect(dataAnalyst?.installed).toBe(true);
  });

  it('should support search, filter, install and toggle enable states', () => {
    const manager = WorkerManager.getInstance();

    // Test search
    const filtered = manager.list().filter(w => w.name.toLowerCase().includes('data'));
    expect(filtered.some(w => w.id === 'worker-1')).toBe(true);

    // Test install toggle
    const support = manager.find('worker-6'); // Customer Support is not installed by default
    expect(support?.installed).toBe(false);

    manager.install('worker-6');
    const supportUpdated = manager.find('worker-6');
    expect(supportUpdated?.installed).toBe(true);
    expect(supportUpdated?.enabled).toBe(true);

    // Test toggle enable
    manager.toggleEnable('worker-6');
    const supportDisabled = manager.find('worker-6');
    expect(supportDisabled?.enabled).toBe(false);
  });

  it('should support duplicating a worker', () => {
    const manager = WorkerManager.getInstance();
    const original = manager.find('worker-1');
    expect(original).toBeDefined();

    const duplicated = manager.duplicate('worker-1');
    expect(duplicated).toBeDefined();
    expect(duplicated.name).toContain('Data Analyst (Cópia)');
    expect(duplicated.id).not.toBe(original?.id);
  });

  it('should support creating and deleting custom workers', () => {
    const manager = WorkerManager.getInstance();
    const custom = manager.createCustom({
      name: 'Custom Marketing Bot',
      description: 'Custom social bot',
      avatar: '🤖',
      category: 'Marketing',
      permissions: ['workspace_write'],
      tools: ['slack_connector'],
      capabilities: ['Auto post'],
      promptTemplate: 'Post: {task}',
      suggestedWorkflows: [],
      tags: ['Social'],
      instructions: 'Always friendly',
      llm: 'GPT-4o Advanced',
      temperature: 0.5,
    });

    expect(custom).toBeDefined();
    expect(custom.id).toContain('worker-custom-');

    const found = manager.find(custom.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Custom Marketing Bot');

    manager.deleteCustom(custom.id);
    const deleted = manager.find(custom.id);
    expect(deleted).toBeUndefined();
  });

  it('should execute a worker task and record history/logs', async () => {
    const manager = WorkerManager.getInstance();
    const worker = manager.find('worker-1');
    expect(worker).toBeDefined();

    if (worker) {
      const historyEntry = await executeWorkerTask(worker, 'Analisar faturamento de janeiro de 2025');
      expect(historyEntry).toBeDefined();
      expect(historyEntry.workerId).toBe(worker.id);
      expect(historyEntry.status).toBe('completed');
      expect(historyEntry.output).toBeDefined();

      // Check if logged to manager history
      manager.addHistoryEntry(historyEntry);
      const histList = manager.getHistoryByWorker(worker.id);
      expect(histList.length).toBeGreaterThan(0);
      expect(histList[0].task).toBe('Analisar faturamento de janeiro de 2025');
    }
  });

  it('should schedule worker tasks successfully', () => {
    const scheduler = WorkerScheduler.getInstance();
    const tasks = scheduler.list();
    expect(tasks.length).toBeGreaterThan(0);

    const newTask = scheduler.create({
      workerId: 'worker-1',
      workerName: 'Data Analyst',
      task: 'Check daily faturamento',
      cronExpression: 'Diariamente às 09:00',
    });

    expect(newTask).toBeDefined();
    expect(newTask.task).toBe('Check daily faturamento');

    const byWorker = scheduler.getByWorker('worker-1');
    expect(byWorker.some(t => t.id === newTask.id)).toBe(true);

    scheduler.toggleStatus(newTask.id);
    const updated = scheduler.list().find(t => t.id === newTask.id);
    expect(updated?.status).toBe('paused');

    scheduler.delete(newTask.id);
    const deleted = scheduler.list().find(t => t.id === newTask.id);
    expect(deleted).toBeUndefined();
  });
});
