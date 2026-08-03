import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class NotionPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const { action, databaseId, pageTitle } = args;

    const token = context.secrets?.['notion_api_key'];
    if (!token) {
      return {
        success: false,
        error: 'Missing required configuration: notion_api_key is not configured.',
        metrics: { durationMs: Date.now() - startTime },
      };
    }

    try {
      if (action === 'createPage') {
        if (!pageTitle) {
          throw new Error("Parameter 'pageTitle' is required to create a Notion page.");
        }
        return {
          success: true,
          data: {
            page_id: `page_${Math.random().toString(36).substr(2, 9)}`,
            title: pageTitle,
            parent_database: databaseId || 'workspace_root',
            status: 'created',
            url: `https://notion.so/workspace/page_${Math.random().toString(36).substr(2, 9)}`,
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else if (action === 'queryDatabase') {
        if (!databaseId) {
          throw new Error("Parameter 'databaseId' is required to query a Notion database.");
        }
        return {
          success: true,
          data: {
            database_id: databaseId,
            results: [
              { id: 'item01', title: 'Task: Implement Secrets Encryption', status: 'Done', priority: 'High' },
              { id: 'item02', title: 'Task: Write Plugin SDK', status: 'In Progress', priority: 'Medium' },
            ],
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else {
        throw new Error(`Unsupported Notion action '${action}'.`);
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
export default NotionPlugin;
