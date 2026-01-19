/**
 * Screenshot Types
 * 
 * This module defines types related to screenshot operations,
 * including parameters, results, and platform-specific data structures.
 */

/**
 * Window Screenshot Parameters
 * 
 * Parameters for capturing a screenshot of a specific window.
 */
export interface WindowScreenshotParams {
  /** Window handle or identifier */
  windowHandle: string;
  
  /** Whether to include window frame (default: true) */
  includeFrame?: boolean;
}

/**
 * Region Screenshot Parameters
 * 
 * Parameters for capturing a screenshot of a screen region.
 */
export interface RegionScreenshotParams {
  /** Region left-top X coordinate */
  x: number;
  
  /** Region left-top Y coordinate */
  y: number;
  
  /** Region width in pixels */
  width: number;
  
  /** Region height in pixels */
  height: number;
  
  /** Display number for multi-monitor environments (default: primary display) */
  display?: number;
}

/**
 * Screenshot Result
 * 
 * Result of a successful screenshot operation.
 */
export interface ScreenshotResult {
  /** Base64 encoded PNG image */
  image: string;
  
  /** MIME type (always "image/png") */
  mimeType: string;
  
  /** Image width in pixels */
  width: number;
  
  /** Image height in pixels */
  height: number;
  
  /** ISO 8601 timestamp of when the screenshot was taken */
  timestamp: string;
}

/**
 * List Windows Parameters
 * 
 * Parameters for listing available windows.
 */
export interface ListWindowsParams {
  /** Whether to include minimized windows (default: false) */
  includeMinimized?: boolean;
}

/**
 * Window Information
 * 
 * Information about a window in the system.
 */
export interface WindowInfo {
  /** Window handle or identifier */
  handle: string;
  
  /** Window title */
  title: string;
  
  /** Process name */
  processName: string;
  
  /** Window bounds */
  bounds: Rectangle;
}

/**
 * List Windows Result
 * 
 * Result of listing windows operation.
 */
export interface ListWindowsResult {
  /** Array of window information */
  windows: WindowInfo[];
}

/**
 * Point
 * 
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle
 * 
 * Represents a rectangular region.
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Image Buffer
 * 
 * Raw image data buffer from platform screenshot operations.
 */
export interface ImageBuffer {
  /** Raw image data */
  data: Buffer;
  
  /** Image width in pixels */
  width: number;
  
  /** Image height in pixels */
  height: number;
  
  /** Pixel format */
  format: 'RGBA' | 'RGB' | 'BGRA';
}

/**
 * Display Information
 * 
 * Information about a display/monitor.
 */
export interface DisplayInfo {
  /** Display identifier */
  id: number;
  
  /** Display bounds */
  bounds: Rectangle;
  
  /** Whether this is the primary display */
  isPrimary: boolean;
}
