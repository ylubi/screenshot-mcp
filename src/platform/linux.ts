/**
 * Linux Platform Implementation
 * 
 * Platform-specific screenshot implementation for Linux.
 * Uses X11 or Wayland protocol.
 * 
 * @note This is a stub implementation. Full implementation will be added in task 8.1.
 */

import type { PlatformScreenshot } from './interface.js';
import type { ImageBuffer, WindowInfo, DisplayInfo } from '../types/index.js';
import { ErrorCode, PlatformError } from '../types/errors.js';

/**
 * Linux Platform Screenshot Implementation
 */
export class LinuxPlatform implements PlatformScreenshot {
  /**
   * Capture a screenshot of a specific window
   */
  async captureWindow(_handle: string, _includeFrame: boolean): Promise<ImageBuffer> {
    throw new PlatformError(
      ErrorCode.CAPTURE_FAILED,
      'Linux platform implementation not yet complete',
      { method: 'captureWindow' }
    );
  }

  /**
   * Capture a screenshot of a screen region
   */
  async captureRegion(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    _display: number
  ): Promise<ImageBuffer> {
    throw new PlatformError(
      ErrorCode.CAPTURE_FAILED,
      'Linux platform implementation not yet complete',
      { method: 'captureRegion' }
    );
  }

  /**
   * List all available windows
   */
  async listWindows(_includeMinimized: boolean): Promise<WindowInfo[]> {
    throw new PlatformError(
      ErrorCode.CAPTURE_FAILED,
      'Linux platform implementation not yet complete',
      { method: 'listWindows' }
    );
  }

  /**
   * Get information about available displays
   */
  async getDisplayInfo(): Promise<DisplayInfo[]> {
    throw new PlatformError(
      ErrorCode.CAPTURE_FAILED,
      'Linux platform implementation not yet complete',
      { method: 'getDisplayInfo' }
    );
  }
}
