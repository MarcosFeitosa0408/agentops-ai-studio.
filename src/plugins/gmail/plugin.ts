import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class GmailPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const { action, to, subject, body, query } = args;

    const credentials = context.secrets?.['gmail_oauth_token'] || context.secrets?.['gmail_api_key'];
    if (!credentials) {
      return {
        success: false,
        error: 'Missing required configuration: gmail_oauth_token is not configured.',
        metrics: { durationMs: Date.now() - startTime },
      };
    }

    try {
      if (action === 'sendEmail') {
        if (!to || !subject || !body) {
          throw new Error("Parameters 'to', 'subject', and 'body' are required to send an email.");
        }
        return {
          success: true,
          data: {
            to,
            subject,
            status: 'sent',
            id: `gmail_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else if (action === 'searchEmails') {
        const searchQuery = query || 'is:unread';
        return {
          success: true,
          data: {
            query: searchQuery,
            emails: [
              { id: 'm01', from: 'boss@corporate.com', subject: 'Urgent: Release Sprint 9 code', date: '2026-08-01T15:30:00Z' },
              { id: 'm02', from: 'alerts@ops.com', subject: 'Workspace Isolation Enabled', date: '2026-08-01T10:10:00Z' },
            ],
          },
          metrics: { durationMs: Date.now() - startTime },
        };
      } else {
        throw new Error(`Unsupported Gmail action '${action}'.`);
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
export default GmailPlugin;
