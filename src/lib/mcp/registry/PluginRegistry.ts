import { Plugin, PluginManifest } from '@/plugins/types';
import { getStandardPlugins } from '@/plugins';

/**
 * Standard representation of a loaded, active plugin.
 */
export interface RegisteredPlugin {
  manifest: PluginManifest;
  plugin: Plugin;
  enabled: boolean;
  installed: boolean;
  health: 'healthy' | 'unhealthy';
  latencyMs: number;
  lastExecuted: string;
  errorCount: number;
  successCount: number;
  deprecated: boolean;
}

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins = new Map<string, RegisteredPlugin>();
  private storageKey = 'agentops_installed_plugins_config';

  private constructor() {
    this.discoverPlugins();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Discovers and registers built-in standard connector plugins.
   * Restores enable/disable/installation states from localStorage.
   */
  public discoverPlugins(): void {
    const standard = getStandardPlugins();
    const config = this.getSavedConfig();

    this.plugins.clear();

    for (const plugin of standard) {
      const manifest = plugin.manifest;

      // Semantic Versioning - Check for deprecation
      const isDeprecated = this.isVersionDeprecated(manifest.version) || !!manifest.isDeprecated;

      // Validate Manifest format
      const validationError = this.validateManifest(manifest);
      if (validationError) {
        console.error(`[PluginRegistry] Invalid manifest for plugin '${manifest.name}': ${validationError}`);
        continue;
      }

      // Check for Duplicates
      if (this.plugins.has(manifest.id)) {
        console.warn(`[PluginRegistry] Duplicate plugin detected for ID '${manifest.id}'. Skipping.`);
        continue;
      }

      // Restore stored instance configuration
      const storedConfig = config[manifest.id] || {
        enabled: true, // Default enabled
        installed: true, // Standard builtins are pre-installed
      };

      this.plugins.set(manifest.id, {
        manifest,
        plugin,
        enabled: storedConfig.enabled,
        installed: storedConfig.installed,
        health: 'healthy',
        latencyMs: 0,
        lastExecuted: storedConfig.lastExecuted || 'Never',
        errorCount: storedConfig.errorCount || 0,
        successCount: storedConfig.successCount || 0,
        deprecated: isDeprecated,
      });
    }
  }

  /**
   * Helper to validate a plugin's manifest format.
   */
  public validateManifest(manifest: PluginManifest): string | null {
    if (!manifest.id || typeof manifest.id !== 'string') return 'Missing string parameter: id';
    if (!manifest.name || typeof manifest.name !== 'string') return 'Missing string parameter: name';
    if (!manifest.version || typeof manifest.version !== 'string') return 'Missing string parameter: version';
    if (!manifest.permissions || !Array.isArray(manifest.permissions)) return 'Missing array parameter: permissions';
    if (!manifest.schema || typeof manifest.schema !== 'object') return 'Missing object parameter: schema';

    // Semver check: Match format Major.Minor.Patch
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(manifest.version)) {
      return `Invalid version format '${manifest.version}'. Version must conform to semantic versioning (Major.Minor.Patch).`;
    }

    return null;
  }

  /**
   * Version check: simple semver parser. Checks if version is below 1.0.0 (marked as beta/deprecated).
   */
  public isVersionDeprecated(version: string): boolean {
    try {
      const parts = version.split('.').map(Number);
      if (parts.length > 0 && parts[0] < 1) {
        return true; // Any version below 1.x.x is deprecated/beta
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Install a new plugin (simulated or custom).
   */
  public installPlugin(plugin: Plugin): { success: boolean; error?: string } {
    const manifest = plugin.manifest;

    const validationError = this.validateManifest(manifest);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Version collision / Duplication check
    if (this.plugins.has(manifest.id)) {
      const existing = this.plugins.get(manifest.id)!;
      if (existing.manifest.version === manifest.version) {
        return { success: false, error: `Duplicate Plugin: Plugin with ID '${manifest.id}' and version '${manifest.version}' is already installed.` };
      }

      // Semantic Versioning compatibility validation
      const compare = this.compareVersions(manifest.version, existing.manifest.version);
      if (compare <= 0) {
        return { success: false, error: `Incompatible Version: Version '${manifest.version}' is older or identical to currently installed '${existing.manifest.version}'.` };
      }
    }

    this.plugins.set(manifest.id, {
      manifest,
      plugin,
      enabled: true,
      installed: true,
      health: 'healthy',
      latencyMs: 0,
      lastExecuted: 'Never',
      errorCount: 0,
      successCount: 0,
      deprecated: this.isVersionDeprecated(manifest.version) || !!manifest.isDeprecated,
    });

    this.saveConfig();
    return { success: true };
  }

  /**
   * Enables a plugin.
   */
  public enablePlugin(id: string): boolean {
    const reg = this.plugins.get(id);
    if (reg) {
      reg.enabled = true;
      this.saveConfig();
      return true;
    }
    return false;
  }

  /**
   * Disables a plugin.
   */
  public disablePlugin(id: string): boolean {
    const reg = this.plugins.get(id);
    if (reg) {
      reg.enabled = false;
      this.saveConfig();
      return true;
    }
    return false;
  }

  /**
   * Removes a plugin. Built-in plugins are set to installed: false. Custom plugins deleted.
   */
  public removePlugin(id: string): boolean {
    const reg = this.plugins.get(id);
    if (reg) {
      reg.enabled = false;
      reg.installed = false;
      this.saveConfig();
      return true;
    }
    return false;
  }

  /**
   * Updates operational metrics for plugin execution (latency, timestamps, error counts).
   */
  public logExecution(id: string, durationMs: number, success: boolean): void {
    const reg = this.plugins.get(id);
    if (reg) {
      reg.latencyMs = durationMs;
      reg.lastExecuted = new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString();
      if (success) {
        reg.successCount += 1;
        reg.health = 'healthy';
      } else {
        reg.errorCount += 1;
        // Mark as unhealthy if failure rate is critical
        if (reg.errorCount > 3) {
          reg.health = 'unhealthy';
        }
      }
      this.saveConfig();
    }
  }

  public get(id: string): RegisteredPlugin | undefined {
    return this.plugins.get(id);
  }

  public list(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  public listInstalled(): RegisteredPlugin[] {
    return this.list().filter((p) => p.installed);
  }

  public listEnabled(): RegisteredPlugin[] {
    return this.list().filter((p) => p.installed && p.enabled);
  }

  // Version Comparison Helpers
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  // LocalStorage Persisted Config Operations
  private getSavedConfig(): Record<string, { enabled: boolean; installed: boolean; lastExecuted?: string; errorCount?: number; successCount?: number }> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved: Record<string, Record<string, unknown>> = {};
      for (const [id, reg] of this.plugins.entries()) {
        saved[id] = {
          enabled: reg.enabled,
          installed: reg.installed,
          lastExecuted: reg.lastExecuted,
          errorCount: reg.errorCount,
          successCount: reg.successCount,
        };
      }
      localStorage.setItem(this.storageKey, JSON.stringify(saved));
    } catch (err) {
      console.error('[PluginRegistry] Failed to save config to localStorage:', err);
    }
  }
}
export default PluginRegistry;
