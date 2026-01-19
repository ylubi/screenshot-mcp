/**
 * macOS Platform Implementation
 * 
 * Platform-specific screenshot implementation for macOS.
 * Uses node-screenshots library which wraps Core Graphics (CGWindowListCreateImage).
 * 
 * This implementation provides:
 * - Window screenshot capture by window ID
 * - Screen region screenshot capture
 * - Window enumeration and listing
 * - Display/monitor information retrieval
 */

import { Window, Monitor, Image } from 'node-screenshots';
import type { PlatformScreenshot } from './interface.js';
import type { ImageBuffer, WindowInfo, DisplayInfo } from '../types/index.js';
import { ErrorCode, PlatformError } from '../types/errors.js';

/**
 * macOS Platform Screenshot Implementation
 * 
 * Implements the PlatformScreenshot interface using node-screenshots library
 * for macOS-specific screenshot operations.
 */
export class MacOSPlatform implements PlatformScreenshot {
  /**
   * Capture a screenshot of a specific window
   * 
   * @param handle - Window ID as string (will be parsed to number)
   * @param includeFrame - Whether to include window frame (currently not used by node-screenshots)
   * @returns Promise resolving to image buffer with RGBA format
   * @throws {PlatformError} If window not found or capture fails
   */
  async captureWindow(handle: string, includeFrame: boolean): Promise<ImageBuffer> {
    try {
      // Parse window handle to number
      const windowId = parseInt(handle, 10);
      if (isNaN(windowId)) {
        throw new PlatformError(
          ErrorCode.INVALID_PARAMS,
          `Invalid window handle: ${handle}. Expected numeric window ID.`,
          { handle, includeFrame }
        );
      }

      // Get all windows and find the target window
      const windows = Window.all();
      const targetWindow = windows.find(w => w.id === windowId);

      if (!targetWindow) {
        throw new PlatformError(
          ErrorCode.WINDOW_NOT_FOUND,
          `Window with ID ${windowId} not found`,
          { windowId, availableWindows: windows.length }
        );
      }

      // Capture the window image
      const image = await targetWindow.captureImage();
      
      // Convert to image buffer
      return await this.convertImageToBuffer(image);

    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      
      throw new PlatformError(
        ErrorCode.CAPTURE_FAILED,
        `Failed to capture window screenshot: ${(error as Error).message}`,
        { handle, includeFrame, originalError: (error as Error).message }
      );
    }
  }

  /**
   * Capture a screenshot of a screen region
   * 
   * @param x - Region left-top X coordinate
   * @param y - Region left-top Y coordinate
   * @param width - Region width in pixels
   * @param height - Region height in pixels
   * @param display - Display number (0 for primary, 1+ for secondary)
   * @returns Promise resolving to image buffer with RGBA format
   * @throws {PlatformError} If region is out of bounds or capture fails
   */
  async captureRegion(
    x: number,
    y: number,
    width: number,
    height: number,
    display: number
  ): Promise<ImageBuffer> {
    try {
      // Get all monitors
      const monitors = Monitor.all();
      
      if (monitors.length === 0) {
        throw new PlatformError(
          ErrorCode.CAPTURE_FAILED,
          'No monitors found',
          { x, y, width, height, display }
        );
      }

      // Select the target monitor
      let targetMonitor: Monitor;
      if (display === 0) {
        // Use primary monitor
        const primaryMonitor = monitors.find(m => m.isPrimary);
        if (!primaryMonitor) {
          targetMonitor = monitors[0]; // Fallback to first monitor
        } else {
          targetMonitor = primaryMonitor;
        }
      } else {
        // Use specified monitor (1-indexed for user, 0-indexed in array)
        const monitorIndex = display - 1;
        if (monitorIndex < 0 || monitorIndex >= monitors.length) {
          throw new PlatformError(
            ErrorCode.REGION_OUT_OF_BOUNDS,
            `Display ${display} not found. Available displays: ${monitors.length}`,
            { display, availableDisplays: monitors.length }
          );
        }
        targetMonitor = monitors[monitorIndex];
      }

      // Validate region is within monitor bounds
      if (x < 0 || y < 0 || width <= 0 || height <= 0) {
        throw new PlatformError(
          ErrorCode.REGION_OUT_OF_BOUNDS,
          `Invalid region coordinates: x=${x}, y=${y}, width=${width}, height=${height}`,
          { x, y, width, height }
        );
      }

      if (x + width > targetMonitor.width || y + height > targetMonitor.height) {
        throw new PlatformError(
          ErrorCode.REGION_OUT_OF_BOUNDS,
          `Region exceeds monitor bounds. Monitor: ${targetMonitor.width}x${targetMonitor.height}, Region: ${x},${y} ${width}x${height}`,
          { 
            x, y, width, height,
            monitorWidth: targetMonitor.width,
            monitorHeight: targetMonitor.height
          }
        );
      }

      // Capture the full monitor
      const fullImage = await targetMonitor.captureImage();
      
      // Crop to the specified region
      const croppedImage = await fullImage.crop(x, y, width, height);
      
      // Convert to image buffer
      return await this.convertImageToBuffer(croppedImage);

    } catch (error) {
      if (error instanceof PlatformError) {
        throw error;
      }
      
      throw new PlatformError(
        ErrorCode.CAPTURE_FAILED,
        `Failed to capture region screenshot: ${(error as Error).message}`,
        { x, y, width, height, display, originalError: (error as Error).message }
      );
    }
  }

  /**
   * List all available windows
   * 
   * @param includeMinimized - Whether to include minimized windows
   * @returns Promise resolving to array of window information
   */
  async listWindows(includeMinimized: boolean): Promise<WindowInfo[]> {
    try {
      // Get all windows
      const windows = Window.all();
      
      // Filter and map to WindowInfo format
      const windowInfos: WindowInfo[] = windows
        .filter(w => {
          // Filter out minimized windows if requested
          if (!includeMinimized && w.isMinimized) {
            return false;
          }
          // Filter out windows with empty titles (usually system windows)
          return w.title.trim().length > 0;
        })
        .map(w => ({
          handle: w.id.toString(),
          title: w.title,
          processName: w.appName,
          bounds: {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height
          }
        }));

      // Sort by title (case-insensitive)
      windowInfos.sort((a, b) => 
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      return windowInfos;

    } catch (error) {
      throw new PlatformError(
        ErrorCode.CAPTURE_FAILED,
        `Failed to list windows: ${(error as Error).message}`,
        { includeMinimized, originalError: (error as Error).message }
      );
    }
  }

  /**
   * Get information about available displays
   * 
   * @returns Promise resolving to array of display information
   */
  async getDisplayInfo(): Promise<DisplayInfo[]> {
    try {
      // Get all monitors
      const monitors = Monitor.all();
      
      // Map to DisplayInfo format
      const displayInfos: DisplayInfo[] = monitors.map(m => ({
        id: m.id,
        bounds: {
          x: m.x,
          y: m.y,
          width: m.width,
          height: m.height
        },
        isPrimary: m.isPrimary
      }));

      return displayInfos;

    } catch (error) {
      throw new PlatformError(
        ErrorCode.CAPTURE_FAILED,
        `Failed to get display info: ${(error as Error).message}`,
        { originalError: (error as Error).message }
      );
    }
  }

  /**
   * Convert node-screenshots Image to ImageBuffer
   * 
   * Helper method to convert the Image object to our ImageBuffer format.
   * 
   * @param image - node-screenshots Image object
   * @returns Promise resolving to ImageBuffer with raw RGBA data
   */
  private async convertImageToBuffer(image: Image): Promise<ImageBuffer> {
    try {
      // Get raw RGBA data
      const rawBuffer = await image.toRaw();
      
      return {
        data: rawBuffer,
        width: image.width,
        height: image.height,
        format: 'RGBA'
      };
    } catch (error) {
      throw new PlatformError(
        ErrorCode.CAPTURE_FAILED,
        `Failed to convert image to buffer: ${(error as Error).message}`,
        { originalError: (error as Error).message }
      );
    }
  }
}
