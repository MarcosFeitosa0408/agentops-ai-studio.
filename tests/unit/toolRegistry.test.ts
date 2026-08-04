import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ToolRegistry } from '@/lib/tools/registry/ToolRegistry';
import { BaseTool } from '@/lib/tools/base/BaseTool';
import { PluginRegistry } from '@/lib/mcp/registry/PluginRegistry';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability } from '@/lib/tools/types';

class MockTestTool extends BaseTool {
  public id = 'mock_test_tool';
  public name = 'Mock Test Tool';
  public description = 'Useful for testing';
  public category: ToolCategory = 'Calculator';
  public icon = 'Wrench';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'val',
      type: 'number',
      description: 'Some number',
      required: true,
    }
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = [];

  async execute(args: Record<string, unknown>) {
    return { success: true, data: { doubled: (args.val as number) * 2 } };
  }
}

describe('Tool Registry Unit Tests', () => {
  beforeEach(() => {
    // Mock window & localStorage
    const store: Record<string, string> = {
      'agentops_auth_user': JSON.stringify({ role: 'Super Admin' }),
    };
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

    // Reset singletons
    // @ts-expect-error - reset private instance
    ToolRegistry.instance = undefined;
    // @ts-expect-error - reset private instance
    PluginRegistry.instance = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should auto-register default tools on creation', () => {
    const registry = ToolRegistry.getInstance();
    const tools = registry.list();
    expect(tools.length).toBeGreaterThan(0);
    expect(registry.find('calculator_tool')).toBeDefined();
  });

  it('should register and remove custom tools', () => {
    const registry = ToolRegistry.getInstance();
    const tool = new MockTestTool();

    registry.register(tool);
    expect(registry.find(tool.id)).toBe(tool);

    registry.remove(tool.id);
    expect(registry.find(tool.id)).toBeUndefined();
  });

  it('should validate and execute registered tools successfully', async () => {
    const registry = ToolRegistry.getInstance();
    const tool = new MockTestTool();
    registry.register(tool);

    const res = await registry.execute(tool.id, { val: 5 });
    expect(res.success).toBe(true);
    expect((res.data as Record<string, unknown>).doubled).toBe(10);
  });

  it('should reject execution with invalid arguments', async () => {
    const registry = ToolRegistry.getInstance();
    const tool = new MockTestTool();
    registry.register(tool);

    // Missing 'val' property
    await expect(registry.execute(tool.id, {})).rejects.toThrow("Parameter 'val' is required");
  });

  it('should perform health checks across registered tools', async () => {
    const registry = ToolRegistry.getInstance();
    const checks = await registry.healthCheck();

    expect(checks['calculator_tool']).toBeDefined();
    expect(checks['calculator_tool'].status).toBe('healthy');
  });

  it('should accumulate execution statistics correctly', async () => {
    const registry = ToolRegistry.getInstance();
    const tool = new MockTestTool();
    registry.register(tool);

    await registry.execute(tool.id, { val: 1 });
    await registry.execute(tool.id, { val: 2 });

    const stats = registry.statistics();
    expect(stats.executionCounts[tool.id]).toBe(2);
    expect(stats.lastExecutions[tool.id]).not.toBe('Never');
  });

  it('should block Viewer role from executing write operations on plugins', async () => {
    const registry = ToolRegistry.getInstance();

    // Set active user role to Viewer
    localStorage.setItem('agentops_auth_user', JSON.stringify({ role: 'Viewer' }));

    // Mock a plugin tool
    const pluginRegistry = PluginRegistry.getInstance();
    // Enable GMail plugin
    pluginRegistry.enablePlugin('gmail-connector');

    // Attempting to run a write operation
    await expect(registry.execute('plugin-gmail-connector', {
      action: 'sendEmail',
      recipient: 'test@agentops.ai',
      subject: 'Hello',
      body: 'World'
    })).rejects.toThrow('SSO Permission Denied');
  });
});
