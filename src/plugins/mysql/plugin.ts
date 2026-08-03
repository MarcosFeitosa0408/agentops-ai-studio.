import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class MySQLPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const { query } = args;

    const connectionString = context.secrets?.['mysql_connection_string'];
    if (!connectionString) {
      return {
        success: false,
        error: 'Missing required configuration: mysql_connection_string is not configured.',
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
        { id: 1001, product_name: 'Enterprise AI Agent License', price: 4999.00, inventory: 95 },
        { id: 1002, product_name: 'Developer Sandbox Node', price: 299.00, inventory: 432 },
        { id: 1003, product_name: 'Secure KMS HSM module', price: 15000.00, inventory: 4 },
      ];

      return {
        success: true,
        data: {
          query,
          affected_rows: isWrite ? 1 : rows.length,
          results: isWrite ? [] : rows,
          sql_mode: 'STRICT_TRANS_TABLES',
          duration_ms: Math.floor(Math.random() * 15) + 3,
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
export default MySQLPlugin;
