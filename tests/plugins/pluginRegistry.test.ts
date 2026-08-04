import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginRegistry } from '@/lib/mcp/registry/PluginRegistry';
import { Plugin, PluginManifest } from '@/plugins/types';

describe('Plugin Registry Unit Tests', () => {
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

    // Reset singleton instance
    // @ts-expect-error - reset private instance
    PluginRegistry.instance = undefined;
  });

  it('should discover standard plugins upon initialization', () => {
    const registry = PluginRegistry.getInstance();
    const list = registry.list();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some(p => p.manifest.id === 'github-connector')).toBe(true);
  });

  it('should validate plugin manifest correctly', () => {
    const registry = PluginRegistry.getInstance();

    // Correct manifest
    const goodManifest = {
      id: 'custom-plugin',
      name: 'Custom',
      version: '1.0.0',
      description: 'Test description',
      author: 'Test author',
      icon: 'Mail',
      category: 'Collaboration',
      permissions: ['read'],
      schema: { type: 'object' },
    } as unknown as PluginManifest;
    expect(registry.validateManifest(goodManifest)).toBeNull();

    // Invalid id
    const badManifest1 = { ...goodManifest, id: '' } as unknown as PluginManifest;
    expect(registry.validateManifest(badManifest1)).not.toBeNull();

    // Invalid version semver format
    const badManifest2 = { ...goodManifest, version: 'abc' } as unknown as PluginManifest;
    expect(registry.validateManifest(badManifest2)).toContain('semantic versioning');
  });

  it('should verify isVersionDeprecated logic', () => {
    const registry = PluginRegistry.getInstance();
    expect(registry.isVersionDeprecated('0.9.0')).toBe(true);
    expect(registry.isVersionDeprecated('1.0.0')).toBe(false);
    expect(registry.isVersionDeprecated('invalid')).toBe(false); // test catch block
  });

  it('should enable and disable plugins', () => {
    const registry = PluginRegistry.getInstance();
    const pluginId = 'github-connector';

    registry.disablePlugin(pluginId);
    expect(registry.get(pluginId)?.enabled).toBe(false);

    registry.enablePlugin(pluginId);
    expect(registry.get(pluginId)?.enabled).toBe(true);

    // Non-existent plugin
    expect(registry.enablePlugin('fake')).toBe(false);
    expect(registry.disablePlugin('fake')).toBe(false);
  });

  it('should remove/uninstall a plugin', () => {
    const registry = PluginRegistry.getInstance();
    const pluginId = 'github-connector';

    registry.removePlugin(pluginId);
    expect(registry.get(pluginId)?.installed).toBe(false);
    expect(registry.removePlugin('fake')).toBe(false);
  });

  it('should log execution metrics for a plugin', () => {
    const registry = PluginRegistry.getInstance();
    const pluginId = 'github-connector';

    registry.logExecution(pluginId, 150, true);
    const updated = registry.get(pluginId);
    expect(updated?.successCount).toBe(1);
    expect(updated?.latencyMs).toBe(150);
    expect(updated?.health).toBe('healthy');

    // Test failures leading to unhealthy state
    registry.logExecution(pluginId, 50, false);
    registry.logExecution(pluginId, 50, false);
    registry.logExecution(pluginId, 50, false);
    registry.logExecution(pluginId, 50, false);
    expect(registry.get(pluginId)?.health).toBe('unhealthy');
  });

  it('should support installing compatible new plugins', () => {
    const registry = PluginRegistry.getInstance();
    const mockPlugin: Plugin = {
      manifest: {
        id: 'new-plugin',
        name: 'New Custom Tool',
        version: '1.1.2',
        description: 'Mock custom tool',
        author: 'Test author',
        icon: 'Mail',
        category: 'Collaboration',
        permissions: [],
        schema: { type: 'object', properties: {} },
      },
      execute: async () => ({ success: true, result: 'done' }),
    };

    const res = registry.installPlugin(mockPlugin);
    expect(res.success).toBe(true);
    expect(registry.get('new-plugin')).toBeDefined();
  });

  it('should reject installing duplicate plugin versions or older versions', () => {
    const registry = PluginRegistry.getInstance();
    const mockPlugin: Plugin = {
      manifest: {
        id: 'new-plugin',
        name: 'New Custom Tool',
        version: '1.0.0',
        description: 'Mock custom tool',
        author: 'Test author',
        icon: 'Mail',
        category: 'Collaboration',
        permissions: [],
        schema: { type: 'object', properties: {} },
      },
      execute: async () => ({ success: true, result: 'done' }),
    };

    // First install
    expect(registry.installPlugin(mockPlugin).success).toBe(true);

    // Try installing same version
    const resDuplicate = registry.installPlugin(mockPlugin);
    expect(resDuplicate.success).toBe(false);
    expect(resDuplicate.error).toContain('Duplicate Plugin');

    // Try installing older version
    const olderPlugin = {
      ...mockPlugin,
      manifest: { ...mockPlugin.manifest, version: '0.9.0' }
    } as unknown as Plugin;
    const resOlder = registry.installPlugin(olderPlugin);
    expect(resOlder.success).toBe(false);
    expect(resOlder.error).toContain('Incompatible Version');
  });

  it('should list only installed and enabled plugins correctly', () => {
    const registry = PluginRegistry.getInstance();
    const installedBefore = registry.listInstalled().length;
    const enabledBefore = registry.listEnabled().length;

    registry.disablePlugin('github-connector');
    expect(registry.listEnabled().length).toBe(enabledBefore - 1);
    expect(registry.listInstalled().length).toBe(installedBefore);

    registry.removePlugin('github-connector');
    expect(registry.listInstalled().length).toBe(installedBefore - 1);
  });
});
