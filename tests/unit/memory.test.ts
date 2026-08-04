import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryStorage } from '@/lib/memory/storage/MemoryStorage';

describe('Memory Storage Unit Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => '',
    };

    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', mockLocalStorage);

    // Clear static instance before each test
    // @ts-expect-error - accessing private constructor / static field
    MemoryStorage.instance = undefined;
  });

  it('should initialize with mock memories if storage is empty', () => {
    const storage = MemoryStorage.getInstance();
    const list = storage.list();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toBe('mem-1');
  });

  it('should save a new memory item', () => {
    const storage = MemoryStorage.getInstance();
    const item = storage.save({
      content: 'System prefers dark mode UI.',
      scope: 'user',
      category: 'core_preference',
      metadata: { tags: ['dark-mode', 'ui'] },
      type: 'long-term'
    });

    expect(item.id).toBeDefined();
    expect(item.content).toBe('System prefers dark mode UI.');
    expect(storage.list()[0].id).toBe(item.id);
  });

  it('should update an existing memory item', () => {
    const storage = MemoryStorage.getInstance();
    const originalItem = storage.list()[0];

    const updated = storage.update(originalItem.id, {
      content: 'Updated content text here.'
    });

    expect(updated.id).toBe(originalItem.id);
    expect(updated.content).toBe('Updated content text here.');
  });

  it('should fail to update nonexistent memory', () => {
    const storage = MemoryStorage.getInstance();
    expect(() => storage.update('nonexistent-id', { content: 'test' })).toThrow();
  });

  it('should delete a memory item', () => {
    const storage = MemoryStorage.getInstance();
    const listBefore = storage.list();
    const deleteId = listBefore[0].id;

    storage.delete(deleteId);

    const listAfter = storage.list();
    expect(listAfter.length).toBe(listBefore.length - 1);
    expect(listAfter.find(m => m.id === deleteId)).toBeUndefined();
  });

  it('should perform search and score items appropriately', () => {
    const storage = MemoryStorage.getInstance();
    const results = storage.search('Claude');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0.5);
    expect(results[0].item.content).toContain('Claude');
  });

  it('should compute metrics in statistics', () => {
    const storage = MemoryStorage.getInstance();
    const stats = storage.statistics();

    expect(stats.totalCount).toBe(storage.list().length);
    expect(stats.byScope.user).toBeDefined();
    expect(stats.byCategory.core_preference).toBeDefined();
  });
});
