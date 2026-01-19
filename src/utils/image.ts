/**
 * Image Processing Utilities
 * 
 * Provides utilities for image encoding, format conversion, and metadata extraction.
 * Handles conversion from raw image buffers to Base64-encoded PNG format.
 */

import { ImageBuffer, ScreenshotResult } from '../types/index.js';
import { ErrorCode, ScreenshotError } from '../types/errors.js';

/**
 * Convert ImageBuffer to Base64-encoded PNG
 * 
 * @param imageBuffer - Raw image buffer from platform screenshot
 * @returns Base64-encoded PNG string
 * @throws {ScreenshotError} If encoding fails
 */
export async function encodeImageToBase64(imageBuffer: ImageBuffer): Promise<string> {
  try {
    // For now, node-screenshots already provides PNG data
    // We just need to convert Buffer to Base64
    const base64 = imageBuffer.data.toString('base64');
    return base64;
  } catch (error) {
    throw new ScreenshotError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to encode image to Base64',
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

/**
 * Create a complete ScreenshotResult from ImageBuffer
 * 
 * @param imageBuffer - Raw image buffer from platform screenshot
 * @returns Complete screenshot result with metadata
 */
export async function createScreenshotResult(imageBuffer: ImageBuffer): Promise<ScreenshotResult> {
  const base64Image = await encodeImageToBase64(imageBuffer);
  
  return {
    image: base64Image,
    mimeType: 'image/png',
    width: imageBuffer.width,
    height: imageBuffer.height,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate image dimensions
 * 
 * @param width - Image width
 * @param height - Image height
 * @throws {ScreenshotError} If dimensions are invalid
 */
export function validateImageDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || width <= 0) {
    throw new ScreenshotError(
      ErrorCode.INVALID_PARAMS,
      'Image width must be a positive integer',
      { width }
    );
  }
  
  if (!Number.isInteger(height) || height <= 0) {
    throw new ScreenshotError(
      ErrorCode.INVALID_PARAMS,
      'Image height must be a positive integer',
      { height }
    );
  }
}
