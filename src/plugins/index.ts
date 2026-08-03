import { Plugin } from './types';
import { GitHubPlugin } from './github/plugin';
import { SlackPlugin } from './slack/plugin';
import { GmailPlugin } from './gmail/plugin';
import { NotionPlugin } from './notion/plugin';
import { GoogleDrivePlugin } from './google-drive/plugin';
import { PostgreSQLPlugin } from './postgresql/plugin';
import { MySQLPlugin } from './mysql/plugin';
import { FilesystemPlugin } from './filesystem/plugin';

export * from './types';

/**
 * Returns list of all standard built-in connector plugins.
 */
export function getStandardPlugins(): Plugin[] {
  return [
    new GitHubPlugin(),
    new SlackPlugin(),
    new GmailPlugin(),
    new NotionPlugin(),
    new GoogleDrivePlugin(),
    new PostgreSQLPlugin(),
    new MySQLPlugin(),
    new FilesystemPlugin(),
  ];
}
export default getStandardPlugins;
