export interface OrganizationSettings {
  themeColor: string; // e.g. '#6d28d9'
  allowedLLMs: string[]; // e.g. ['GPT-4o Advanced', 'Claude 3.5 Sonnet (Default)']
  requireMFA: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelist: string[];
  allowedPluginCategories: string[];
  enableAuditLogSymmetricEncryption: boolean;
}

export const DEFAULT_SETTINGS: OrganizationSettings = {
  themeColor: '#6d28d9',
  allowedLLMs: ['GPT-4o Advanced', 'Claude 3.5 Sonnet (Default)', 'Gemini 1.5 Pro', 'Azure OpenAI'],
  requireMFA: false,
  sessionTimeoutMinutes: 120,
  ipWhitelist: [],
  allowedPluginCategories: ['Analytics', 'Business', 'Marketing', 'Development', 'Productivity'],
  enableAuditLogSymmetricEncryption: true,
};
