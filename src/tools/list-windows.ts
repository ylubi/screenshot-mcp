/**
 * List Windows Tool
 * 
 * MCP tool for listing all available windows.
 */

import { Tool, ToolDefinition, ToolResult, WindowInfo } from '../types/index.js';
import { PlatformScreenshot } from '../platform/interface.js';
import { ScreenshotError } from '../types/errors.js';

/**
 * List Windows Tool Parameters
 */
export interface ListWindowsParams {
  includeMinimized?: boolean;
}

/**
 * List Windows Result
 */
export interface ListWindowsResult {
  windows: WindowInfo[];
}

/**
 * List Windows Tool Implementation
 */
export class ListWindowsTool implements Tool {
  definition: ToolDefinition = {
    name: 'list_windows',
    description: 'List all available windows with their numeric handles and metadata. Use this tool FIRST to get window handles before calling capture_window. Returns an array of windows, each with a numeric handle (e.g., "12345"), title, process name, and bounds.',
    inputSchema: {
      type: 'object',
      properties: {
        includeMinimized: {
          type: 'boolean',
          description: 'Whether to include minimized windows in the results (default: false)',
          default: false,
        },
      },
      required: [],
    },
  };

  constructor(private platform: PlatformScreenshot) {}

  /**
   * Execute the list windows tool
   * 
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(params: any): Promise<ToolResult> {
    try {
      const includeMinimized = params?.includeMinimized ?? false;
      
      // Get windows from platform
      const windows = await this.platform.listWindows(includeMinimized);
      
      // Sort windows by title
      const sortedWindows = windows.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
      
      const result: ListWindowsResult = {
        windows: sortedWindows,
      };
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof ScreenshotError) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
