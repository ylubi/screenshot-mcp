/**
 * Save Screenshot Tool
 * 
 * MCP tool for saving base64 screenshot data to a file.
 */

import { Tool, ToolDefinition, ToolResult } from '../types/index.js';
import { ScreenshotError, ErrorCode } from '../types/errors.js';
import { promises as fs } from 'fs';
import { dirname, resolve, extname } from 'path';

/**
 * Save Screenshot Tool Parameters
 */
export interface SaveScreenshotParams {
  image: string;
  filePath: string;
  overwrite?: boolean;
}

/**
 * Save Screenshot Result
 */
export interface SaveScreenshotResult {
  filePath: string;
  fileSize: number;
  saved: boolean;
}

/**
 * Save Screenshot Tool Implementation
 */
export class SaveScreenshotTool implements Tool {
  definition: ToolDefinition = {
    name: 'save_screenshot',
    description: 'Save a base64-encoded screenshot image to a file. Use this AFTER capturing a screenshot with capture_window or capture_region to persist the image. The image parameter must be the base64 string from the screenshot result (the "image" field). Only PNG format is supported. The tool will automatically create directories if they don\'t exist. By default, it will NOT overwrite existing files to prevent data loss.',
    inputSchema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          description: 'Base64-encoded PNG image data from a screenshot result. This is the "image" field returned by capture_window or capture_region. Do NOT modify this data.',
        },
        filePath: {
          type: 'string',
          description: 'File path where to save the image. Can be absolute (e.g., "C:\\screenshots\\image.png") or relative (e.g., "./screenshots/image.png"). Must end with .png extension. Parent directories will be created automatically if they don\'t exist.',
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite the file if it already exists. Default is false for safety. Set to true only if you want to replace an existing file.',
          default: false,
        },
      },
      required: ['image', 'filePath'],
    },
  };

  /**
   * Execute the save screenshot tool
   * 
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(params: any): Promise<ToolResult> {
    try {
      // Validate parameters
      if (!params.image || typeof params.image !== 'string') {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          'Invalid parameter: image must be a non-empty base64 string',
          { paramName: 'image' }
        );
      }

      if (!params.filePath || typeof params.filePath !== 'string') {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          'Invalid parameter: filePath must be a non-empty string',
          { paramName: 'filePath' }
        );
      }

      const overwrite = params.overwrite ?? false;
      const filePath = resolve(params.filePath);

      // Validate file extension
      const ext = extname(filePath).toLowerCase();
      if (ext !== '.png') {
        throw new ScreenshotError(
          ErrorCode.INVALID_PARAMS,
          `Invalid file extension: ${ext}. Only .png format is supported`,
          { filePath, extension: ext }
        );
      }

      // Check if file exists
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
        // File doesn't exist, which is fine
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Create directory if it doesn't exist
      const dir = dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Decode base64 and save
      const imageBuffer = Buffer.from(params.image, 'base64');
      await fs.writeFile(filePath, imageBuffer);

      // Get file size
      const stats = await fs.stat(filePath);

      const result: SaveScreenshotResult = {
        filePath,
        fileSize: stats.size,
        saved: true,
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
