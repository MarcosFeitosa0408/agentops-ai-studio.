import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class PostgreSQLPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const { query } = args;

    const connectionString = context.secrets?.['pg_connection_string'];
    if (!connectionString) {
      return {
        success: false,
        error: 'Missing required configuration: pg_connection_string is not configured.',
        metrics: { durationMs: Date.now() - startTime },
      };
    }

    try {
      if (!query || typeof query !== 'string') {
        throw new Error("Parameter 'query' is required and must be a string.");
      }

      const isWrite = /insert|update|delete|drop|alter|create/i.test(query);

      if (isWrite && context.userRole === 'Viewer') {
        throw new Error(`Permission Denied: Viewer role cannot execute write operations.`);
      }

      const rows = [
        { id: 1, name: 'Alice Smith', email: 'alice@agentops.ai', role: 'Admin', active: true },
        { id: 2, name: 'Bob Jones', email: 'bob@agentops.ai', role: 'Developer', active: true },
        { id: 3, name: 'Charlie Miller', email: 'charlie@agentops.ai', role: 'Viewer', active: false },
      ];

      return {
        success: true,
        data: {
          query,
          rows_affected: isWrite ? 1 : rows.length,
          rows: isWrite ? [] : rows.filter(row => {
            if (/active\s*=\s*true/i.test(query)) return row.active;
            if (/role\s*=\s*['"]Admin['"]/i.test(query)) return row.role === 'Admin';
            return true;
          }),
          command: isWrite ? 'UPDATE' : 'SELECT',
          duration_ms: Math.floor(Math.random() * 20) + 5,
        },
        metrics: { durationMs: Date.now() - startTime },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        metrics: { durationMs: Date.now() - startTime },
      };
    }
  }
}
export default PostgreSQLPlugin;
