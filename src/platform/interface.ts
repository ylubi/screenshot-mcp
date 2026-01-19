/**
 * Platform Abstraction Interface
 * 
 * This module defines the platform abstraction layer interface
 * that all platform-specific implementations must follow.
 */

import type { ImageBuffer, WindowInfo, DisplayInfo } from '../types/index.js';

/**
 * Platform Screenshot Interface
 * 
 * Unified interface for cross-platform screenshot operations.
 * Each platform (Windows, macOS, Linux) must implement this interface.
 */
export interface PlatformScreenshot {
  /**
   * Capture a screenshot of a specific window
   * 
   * @param handle - Window handle or identifier
   * @param includeFrame - Whether to include window frame
   * @returns Promise resolving to image buffer
   * @throws {PlatformError} If window not found or capture fails
   */
  captureWindow(handle: string, includeFrame: boolean): Promise<ImageBuffer>;

  /**
   * Capture a screenshot of a screen region
   * 
   * @param x - Region left-top X coordinate
   * @param y - Region left-top Y coordinate
   * @param width - Region width in pixels
   * @param height - Region height in pixels
   * @param display - Display number (default: primary display)
   * @returns Promise resolving to image buffer
   * @throws {PlatformError} If region is out of bounds or capture fails
   */
  captureRegion(
    x: number,
    y: number,
    width: number,
    height: number,
    display: number
  ): Promise<ImageBuffer>;

  /**
   * List all available windows
   * 
   * @param includeMinimized - Whether to include minimized windows
   * @returns Promise resolving to array of window information
   */
  listWindows(includeMinimized: boolean): Promise<WindowInfo[]>;

  /**
   * Get information about available displays
   * 
   * @returns Promise resolving to array of display information
   */
  getDisplayInfo(): Promise<DisplayInfo[]>;
}
