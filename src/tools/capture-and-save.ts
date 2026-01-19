/**
 * Capture and Save Tool
 * 
 * MCP tool for capturing a screenshot and saving it to a file in one operation.
 * This tool combines capture_region/capture_window with save_screenshot to work around
 * the limitation that AI cannot access tool return values in some MCP clients.
 */

import { Tool, ToolDefinition, ToolResult, ImageBuffer } from '../types/index.js';
import { PlatformScreenshot } from '../platform/interface.js';
import { ScreenshotError, ErrorCode } from '../types/errors.js';
import { validateRegionCoordinates, validateDisplay, validateWindowHandle } from '../utils/validation.js';
import { promises as fs } from 'fs';
import { dirname, resolve, extname } from 'path';
import { PNG } from 'pngjs';

/**
 * Capture and Save Tool Parameters
 */
export interface CaptureAndSaveParams {
  // Capture mode
  mode: 'region' | 'window';
  
  // Region parameters (required if mode='region')
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  display?: number;
  
  // Window parameters (required if mode='window')
  windowHandle?: string;
  windowTitle?: string;  // Alternative to windowHandle: search by title
  processName?: string;  // Alternative to windowHandle: search by process name
  includeFrame?: boolean;
  
  // Save parameters (always required)
  filePath: string;
  overwrite?: boolean;
}

/**
 * Capture and Save Result
 */
export interface CaptureAndSaveResult {
  filePath: string;
  fileSize: number;
  imageWidth: number;
  imageHeight: number;
  saved: boolean;
  timestamp: string;
}

/**
 * Capture and Save Tool Implementation
 */
export class CaptureAndSaveTool implements Tool {
  definition: ToolDefinition = {
    name: 'capture_and_save',
    description: 'Capture a screenshot and save it to a file in one operation. This is a convenience tool that combines screenshot capture with file saving. Use this when you want to save a screenshot directly without needing to handle the base64 data. Supports both region and window capture modes. For window mode, you can use windowHandle (numeric ID), windowTitle (search by title), or processName (search by process) - windowTitle or processName is easier as you can directly use the window/process name.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['region', 'window'],
          description: 'Capture mode: "region" to capture a screen region, or "window" to capture a specific window',
        },
        x: {
          type: 'number',
          description: 'X coordinate (required for region mode): top-left corner in pixels',
        },
        y: {
          type: 'number',
          description: 'Y coordinate (required for region mode): top-left corner in pixels',
        },
        width: {
          type: 'number',
          description: 'Width (required for region mode): region width in pixels. Recommended: 200-400',
        },
        height: {
          type: 'number',
          description: 'Height (required for region mode): region height in pixels. Recommended: 200-400',
        },
        display: {
          type: 'number',
          description: 'Display number (optional for region mode): 0 for primary, 1+ for secondary (default: 0)',
          default: 0,
        },
        windowHandle: {
          type: 'string',
          description: 'Window handle (for window mode): numeric window ID from list_windows. One of windowHandle, windowTitle, or processName must be provided.',
        },
        windowTitle: {
          type: 'string',
          description: 'Window title (for window mode): search for window by title (e.g., "简单的UI窗口"). One of windowHandle, windowTitle, or processName must be provided. If multiple windows match, the first one will be used.',
        },
        processName: {
          type: 'string',
          description: 'Process name (for window mode): search for window by process name (e.g., "python.exe", "chrome.exe"). One of windowHandle, windowTitle, or processName must be provided. If multiple windows match, the first one will be used.',
        },
        includeFrame: {
          type: 'boolean',
          description: 'Include frame (optional for window mode): whether to include window border (default: true)',
          default: true,
        },
        filePath: {
          type: 'string',
          description: 'File path (required): where to save the screenshot. Must end with .png. Example: "C:\\screenshots\\image.png"',
        },
        overwrite: {
          type: 'boolean',
          description: 'Overwrite (optional): whether to overwrite existing file (default: false)',
          default: false,
        },
      },
      required: ['mode', 'filePath'],
    },
  };

  constructor(private platform: PlatformScreenshot) {}

  /**
   * Execute the capture and save tool
   * 
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(params: any): Promise<ToolResult> {
    try {
      // Validate mode
      if (!params.mode || (params.mode !== 'region' && params.mode !== 'window')) {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          'Invalid parameter: mode must be "region" or "window"',
          { paramName: 'mode', value: params.mode }
        );
      }

      // Validate filePath
      if (!params.filePath || typeof params.filePath !== 'string') {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          'Invalid parameter: filePath must be a non-empty string',
          { paramName: 'filePath' }
        );
      }

      const filePath = resolve(params.filePath);
      const ext = extname(filePath).toLowerCase();
      
      if (ext !== '.png') {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          `Invalid file extension: ${ext}. Only .png format is supported`,
          { filePath, extension: ext }
        );
      }

      // Check if file exists
      const overwrite = params.overwrite ?? false;
      try {
        await fs.access(filePath);
        if (!overwrite) {
          throw new ScreenshotError(
            ErrorCode.INVALID_PARAMS,
            `File already exists: ${filePath}. Set overwrite=true to replace it`,
            { filePath, exists: true }
          );
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Capture screenshot based on mode
      let imageBuffer: ImageBuffer;
      let width: number;
      let height: number;

      if (params.mode === 'region') {
        // Validate region parameters
        if (params.x === undefined || params.y === undefined || 
            params.width === undefined || params.height === undefined) {
          throw new ScreenshotError(
            ErrorCode.INVALID_PARAMS,
            'Region mode requires x, y, width, and height parameters',
            { mode: 'region' }
          );
        }

        validateRegionCoordinates(params.x, params.y, params.width, params.height);
        const display = validateDisplay(params.display);

        imageBuffer = await this.platform.captureRegion(
          params.x,
          params.y,
          params.width,
          params.height,
          display
        );
        
        width = params.width;
        height = params.height;
      } else {
        // Window mode
        if (!params.windowHandle && !params.windowTitle && !params.processName) {
          throw new ScreenshotError(
            ErrorCode.INVALID_PARAMS,
            'Window mode requires one of windowHandle, windowTitle, or processName parameter',
            { mode: 'window' }
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

        imageBuffer = await this.platform.captureWindow(
          windowHandle,
          includeFrame
        );

        // Get dimensions from ImageBuffer
        width = imageBuffer.width;
        height = imageBuffer.height;
      }

      // Create directory if needed
      const dir = dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Convert ImageBuffer to PNG and save
      const png = new PNG({ width, height });
      png.data = imageBuffer.data;
      const pngBuffer = PNG.sync.write(png);
      
      await fs.writeFile(filePath, pngBuffer);

      // Get file size
      const stats = await fs.stat(filePath);

      const result: CaptureAndSaveResult = {
        filePath,
        fileSize: stats.size,
        imageWidth: width,
        imageHeight: height,
        saved: true,
        timestamp: new Date().toISOString(),
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
