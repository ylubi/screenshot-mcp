/**
 * Window Screenshot Tool
 * 
 * MCP tool for capturing screenshots of specific windows.
 * Supports both single screenshot and long screenshot (with scrolling).
 */

import { Tool, ToolDefinition, ToolResult, ScreenshotResult } from '../types/index.js';
import { PlatformScreenshot } from '../platform/interface.js';
import { validateWindowHandle } from '../utils/validation.js';
import { createScreenshotResult } from '../utils/image.js';
import { captureLongScreenshot, LongScreenshotOptions } from '../utils/long-screenshot.js';
import { ScreenshotError, ErrorCode } from '../types/errors.js';

/**
 * Window Screenshot Tool Parameters
 */
export interface WindowScreenshotParams {
  windowHandle?: string;
  windowTitle?: string;
  processName?: string;
  includeFrame?: boolean;
  longScreenshot?: boolean;
  scrollDelay?: number;
  scrollAmount?: number;
  maxScrolls?: number;
  overlapPixels?: number;
}

/**
 * Window Screenshot Tool Implementation
 */
export class WindowScreenshotTool implements Tool {
  definition: ToolDefinition = {
    name: 'capture_window',
    description: 'Capture a screenshot of a specific window. You can use windowHandle (numeric ID), windowTitle (search by title), or processName (search by process). Using windowTitle or processName is easier as you can directly use the window/process name without calling list_windows first. Supports both single screenshot and long screenshot (set longScreenshot=true to automatically scroll and stitch). Returns base64-encoded PNG image data. IMPORTANT: To save the screenshot to a file, use capture_and_save tool instead, which combines capture and save in one step.',
    inputSchema: {
      type: 'object',
      properties: {
        windowHandle: {
          type: 'string',
          description: 'Window handle (optional): numeric window ID from list_windows (e.g., "12345"). One of windowHandle, windowTitle, or processName must be provided.',
        },
        windowTitle: {
          type: 'string',
          description: 'Window title (optional): search for window by title (e.g., "简单的UI窗口"). One of windowHandle, windowTitle, or processName must be provided. If multiple windows match, the first one will be used.',
        },
        processName: {
          type: 'string',
          description: 'Process name (optional): search for window by process name (e.g., "python.exe", "chrome.exe"). One of windowHandle, windowTitle, or processName must be provided. If multiple windows match, the first one will be used.',
        },
        includeFrame: {
          type: 'boolean',
          description: 'Whether to include the window frame/border in the screenshot (default: true)',
          default: true,
        },
        longScreenshot: {
          type: 'boolean',
          description: 'Long screenshot mode (optional): set to true to automatically scroll the window and stitch multiple screenshots into one long image. Useful for capturing full web pages, long documents, or scrollable lists (default: false). WARNING: Long screenshots return large base64 data and may timeout. Consider using capture_and_save instead.',
          default: false,
        },
        scrollDelay: {
          type: 'number',
          description: 'Scroll delay (optional, for long screenshot): milliseconds to wait between scrolls for content to load (default: 500)',
          default: 500,
        },
        scrollAmount: {
          type: 'number',
          description: 'Scroll amount (optional, for long screenshot): pixels to scroll each time. If not specified, uses 80% of window height',
        },
        maxScrolls: {
          type: 'number',
          description: 'Max scrolls (optional, for long screenshot): maximum number of scroll operations to prevent infinite loops (default: 20)',
          default: 20,
        },
        overlapPixels: {
          type: 'number',
          description: 'Overlap pixels (optional, for long screenshot): number of pixels to overlap between screenshots for better stitching (default: 50)',
          default: 50,
        },
      },
      required: [],
    },
  };

  constructor(private platform: PlatformScreenshot) {}

  /**
   * Execute the window screenshot tool
   * 
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(params: any): Promise<ToolResult> {
    try {
      // Validate that at least one identifier is provided
      if (!params.windowHandle && !params.windowTitle && !params.processName) {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          'One of windowHandle, windowTitle, or processName must be provided',
          { params }
        );
      }

      let windowHandle: string;

      // If windowTitle or processName is provided, search for the window
      if (params.windowTitle || params.processName) {
        const windows = await this.platform.listWindows(false);
        let matchingWindow;

        if (params.windowTitle) {
          matchingWindow = windows.find(w => 
            w.title.includes(params.windowTitle) || 
            w.title === params.windowTitle
          );

          if (!matchingWindow) {
            throw new ScreenshotError(
              ErrorCode.WINDOW_NOT_FOUND,
              `No window found with title containing: ${params.windowTitle}`,
              { windowTitle: params.windowTitle }
            );
          }
        } else if (params.processName) {
          matchingWindow = windows.find(w => 
            w.processName.toLowerCase().includes(params.processName.toLowerCase()) ||
            w.processName.toLowerCase() === params.processName.toLowerCase()
          );

          if (!matchingWindow) {
            throw new ScreenshotError(
              ErrorCode.WINDOW_NOT_FOUND,
              `No window found with process name containing: ${params.processName}`,
              { processName: params.processName }
            );
          }
        }

        windowHandle = matchingWindow!.handle;
      } else {
        // Use provided windowHandle
        validateWindowHandle(params.windowHandle);
        windowHandle = params.windowHandle;
      }
      
      const includeFrame = params.includeFrame ?? true;
      const longScreenshot = params.longScreenshot ?? false;
      
      // Capture screenshot
      let imageBuffer;
      
      if (longScreenshot) {
        // Long screenshot mode: scroll and stitch
        const options: LongScreenshotOptions = {
          scrollDelay: params.scrollDelay,
          scrollAmount: params.scrollAmount,
          maxScrolls: params.maxScrolls,
          overlapPixels: params.overlapPixels,
        };
        
        imageBuffer = await captureLongScreenshot(
          this.platform,
          windowHandle,
          includeFrame,
          options
        );
      } else {
        // Single screenshot mode
        imageBuffer = await this.platform.captureWindow(
          windowHandle,
          includeFrame
        );
      }
      
      // Create result with metadata
      const result: ScreenshotResult = await createScreenshotResult(imageBuffer);
      
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
