# AgentOps AI Studio — Plugin SDK Guide

## Introduction
The Plugin SDK in AgentOps AI Studio allows developers to build modular, secure connectors using the Model Context Protocol (MCP) standard. Each plugin acts as an independent virtual MCP server, exposing tools, validating inputs using JSON schemas, and running with isolated permissions.

---

## 1. Directory Footprint
Every connector plugin is located under `src/plugins/<id>/` and must contain:
```
src/plugins/my-connector/
├── manifest.json   # Declarative settings (ID, Category, Name, Icon)
├── schema.json     # Input validation schema
├── permissions.ts  # Required functional permissions
└── plugin.ts       # Execution logic entry point
```

---

## 2. Declarative Manifest (`manifest.json`)
The manifest configures the metadata, categorization, and identification parameter constraints of the plugin:
```json
{
  "id": "github-connector",
  "name": "GitHub Integration",
  "description": "Exposes actions to search issues, list repositories, and manage pull requests.",
  "version": "1.0.0",
  "author": "AgentOps Enterprise",
  "icon": "Github",
  "category": "DevOps",
  "permissions": ["github:read", "github:write"]
}
```

---

## 3. Parameter Schema (`schema.json`)
Input arguments are validated at runtime using standard JSON Schema definitions:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": ["listIssues", "createIssue", "getRepoDetails"],
      "description": "The target API action."
    },
    "repo": {
      "type": "string",
      "description": "Target repository (e.g. 'owner/repo')."
    },
    "title": {
      "type": "string",
      "description": "The title of the issue to create."
    }
  },
  "required": ["action", "repo"]
}
```

---

## 4. Permissions Footprint (`permissions.ts`)
Declares required security constraints:
```typescript
import { PluginPermission } from '../types';

export const permissions: PluginPermission[] = [
  {
    action: 'listIssues',
    scope: 'read',
    description: 'Allows reading repository issue logs.',
  },
  {
    action: 'createIssue',
    scope: 'write',
    description: 'Allows opening new issues on repositories.',
  }
];
export default permissions;
```

---

## 5. Plugin Execution Class (`plugin.ts`)
The plugin class must implement the `Plugin` interface:
```typescript
import { Plugin, PluginExecutionContext, PluginExecutionResult, PluginManifest } from '../types';
import manifest from './manifest.json';
import schema from './schema.json';

export class MyPlugin implements Plugin {
  public manifest = { ...manifest, schema } as unknown as PluginManifest;

  public async execute(
    args: Record<string, unknown>,
    context: PluginExecutionContext
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const token = context.secrets?.['my_api_token'];

    if (!token) {
      return {
        success: false,
        error: 'Credential token not configured.',
        metrics: { durationMs: Date.now() - startTime },
      };
    }

    try {
      // Execute your API actions here
      return {
        success: true,
        data: { message: "Successfully executed" },
        metrics: { durationMs: Date.now() - startTime }
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        metrics: { durationMs: Date.now() - startTime }
      };
    }
  }
}
```
---

## 6. Registration & Discovery
Once built, add your plugin class to the central array inside `src/plugins/index.ts`:
```typescript
export function getStandardPlugins(): Plugin[] {
  return [
    new GitHubPlugin(),
    new MyPlugin(), // Added
  ];
}
```
The `ToolRegistry` and `PluginRegistry` will automatically discover the plugin, expose its tools to cognitive agents, and render its monitoring dashboard.
