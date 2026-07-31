import { BaseTool } from '../base/BaseTool';
import { ToolCategory, ToolParameter, ToolPermission, ToolCapability, ToolResult } from '../types';

export class CSVTool extends BaseTool {
  public id = 'csv_tool';
  public name = 'CSV Parser';
  public description = 'Fast CSV stream reader capable of slicing and filtering large CSV entries.';
  public category: ToolCategory = 'CSV';
  public icon = 'Table';
  public enabled = true;

  public parameters: ToolParameter[] = [
    {
      name: 'filepath',
      type: 'string',
      description: 'The location of the csv file.',
      required: true,
    },
    {
      name: 'delimiter',
      type: 'string',
      description: 'Default delimiter character.',
      required: false,
      defaultValue: ',',
    },
  ];

  public permissions: ToolPermission[] = [{ role: 'User', allowed: true }];
  public capabilities: ToolCapability[] = ['read', 'analyze'];

  public async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 300));

    const delimiter = (args.delimiter as string) || ',';
    const records = [
      { id: '101', name: 'Agent Smith', role: 'Security Agent', loadIndex: '0.82' },
      { id: '102', name: 'Agent Johnson', role: 'Data Collector', loadIndex: '0.45' },
      { id: '103', name: 'Agent Williams', role: 'Reporter Agent', loadIndex: '0.91' },
    ];

    return {
      success: true,
      data: {
        fileParsed: args.filepath,
        delimiter,
        headers: ['id', 'name', 'role', 'loadIndex'],
        rowsCount: records.length,
        records,
      },
      metrics: {
        durationMs: Date.now() - start,
      },
    };
  }
}
