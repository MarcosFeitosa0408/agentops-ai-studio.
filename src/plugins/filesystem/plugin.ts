import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class FilesystemPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const { action, path, content } = args;

    const rootPath = context.secrets?.['filesystem_root_path'] || '/app/data';

    try {
      if (!path || typeof path !== 'string') {
        throw new Error("Parameter 'path' is required and must be a string.");
      }

      if (action === 'readFile') {
        const mockFileStore: Record<string, string> = {
          'config.json': JSON.stringify({ version: '1.0.0', theme: 'dark', debug: true }, null, 2),
          'README.md': '# Welcome to local filesystem data\nThis is simulated storage.',
          'secrets.env': 'API_KEY=super_secure_vault_token_abc123',
        };

        const resolvedPath = path.replace(/^\.\//, '');
        const data = mockFileStore[resolvedPath];

        if (data === undefined) {
          throw new Error(`File not found at: ${rootPath}/${resolvedPath}`);
        }

        return {
          success: true,
          data: {
            path: `${rootPath}/${resolvedPath}`,
            size: `${data.length} bytes`,
            content: data,
            mimeType: resolvedPath.endsWith('.json') ? 'application/json' : 'text/plain',
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else if (action === 'writeFile') {
        if (content === undefined || typeof content !== 'string') {
          throw new Error("Parameter 'content' is required and must be a string for writeFile.");
        }

        if (context.userRole === 'Viewer') {
          throw new Error(`Permission Denied: Viewer role cannot write to filesystem.`);
        }

        return {
          success: true,
          data: {
            path: `${rootPath}/${path.replace(/^\.\//, '')}`,
            bytes_written: content.length,
            status: 'success',
            last_modified: new Date().toISOString(),
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else if (action === 'listDirectory') {
        return {
          success: true,
          data: {
            directory: `${rootPath}/${path.replace(/^\.\//, '')}`,
            items: [
              { name: 'config.json', type: 'file', size: '48 bytes', updated: '2026-08-01T12:00:00Z' },
              { name: 'README.md', type: 'file', size: '150 bytes', updated: '2026-08-01T12:05:00Z' },
              { name: 'logs', type: 'directory', size: '-', updated: '2026-08-01T14:00:00Z' },
            ],
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else {
        throw new Error(`Unsupported Filesystem action '${action}'.`);
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        metrics: { durationMs: Date.now() - startTime },
      };
    }
  }
}
export default FilesystemPlugin;
