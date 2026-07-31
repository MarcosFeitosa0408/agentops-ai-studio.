import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';

export class RestApiTool extends BaseTool {
  public id = 'rest_api_tool';
  public name = 'REST API Dispatcher';
  public description = 'Dispatches HTTP commands (GET, POST, etc.) and routes response JSON structures securely.';
  public category: ToolCategory = 'REST API';
  public icon = 'Globe';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'url',
      type: 'string',
      description: 'The endpoint url to call.',
      required: true,
    },
    {
      name: 'method',
      type: 'string',
      description: 'HTTP method: GET, POST, PUT, DELETE.',
      required: false,
      defaultValue: 'GET',
    },
    {
      name: 'body',
      type: 'object',
      description: 'The JSON body structure for POST/PUT requests.',
      required: false,
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'Developer', allowed: true }];
  public capabilities: ToolCapability[] = ['execute', 'query'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const url = (args.url as string) || '';
    const method = (args.method as string) || 'GET';

    await new Promise((resolve) => setTimeout(resolve, 550));

    // Realistic API JSON output
    const simulationResponse = {
      urlCalled: url,
      method,
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: {
        success: true,
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        data: {
          message: `Payload successfully dispatched and fetched from downstream.`,
          payload: args.body || null,
          systemStatus: 'ONLINE',
          nodesActive: [4, 5, 9],
        },
      },
    };

    return {
      success: true,
      data: simulationResponse,
      metrics: {
        durationMs: Date.now() - start,
      },
    };
  }
}
