/**
 * Region Screenshot Tool
 * 
 * MCP tool for capturing screenshots of specific screen regions.
 */

import { Tool, ToolDefinition, ToolResult, ScreenshotResult } from '../types/index.js';
import { PlatformScreenshot } from '../platform/interface.js';
import { validateRegionCoordinates, validateDisplay } from '../utils/validation.js';
import { createScreenshotResult } from '../utils/image.js';
import { ScreenshotError } from '../types/errors.js';

/**
 * Region Screenshot Tool Parameters
 */
export interface RegionScreenshotParams {
  x: number;
  y: number;
  width: number;
  height: number;
  display?: number;
}

/**
 * Region Screenshot Tool Implementation
 */
export class RegionScreenshotTool implements Tool {
  definition: ToolDefinition = {
    name: 'capture_region',
    description: 'Capture a screenshot of a specific rectangular region of the screen. This is the simplest way to take screenshots - no need to get window handles. Specify the top-left corner (x, y) and size (width, height) in pixels. Recommended sizes: 200x200 to 400x300 for fast response. Avoid sizes larger than 1000x1000 to prevent timeouts. Returns base64-encoded PNG image data. IMPORTANT: To save the screenshot to a file, use capture_and_save tool instead, which combines capture and save in one step.',
    inputSchema: {
      type: 'object',
      properties: {
        x: {
          type: 'number',
          description: 'X coordinate of the region\'s top-left corner in pixels (0 = left edge of screen)',
        },
        y: {
          type: 'number',
          description: 'Y coordinate of the region\'s top-left corner in pixels (0 = top edge of screen)',
        },
        width: {
          type: 'number',
          description: 'Width of the region in pixels. Recommended: 200-400 for fast response.',
        },
        height: {
          type: 'number',
          description: 'Height of the region in pixels. Recommended: 200-400 for fast response.',
        },
        display: {
          type: 'number',
          description: 'Display/monitor number: 0 for primary display, 1+ for secondary displays (default: 0)',
          default: 0,
        },
      },
      required: ['x', 'y', 'width', 'height'],
    },
  };

  constructor(private platform: PlatformScreenshot) {}

  /**
   * Execute the region screenshot tool
   * 
   * @param params - Tool parameters
   * @returns Tool execution result
   */
  async execute(params: any): Promise<ToolResult> {
    try {
      // Validate parameters
      validateRegionCoordinates(params.x, params.y, params.width, params.height);
      const display = validateDisplay(params.display);
      
      // Capture region screenshot
      const imageBuffer = await this.platform.captureRegion(
        params.x,
        params.y,
        params.width,
        params.height,
        display
      );
      
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
