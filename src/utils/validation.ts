/**
 * Input Validation Utilities
 * 
 * Provides validation functions for screenshot tool parameters.
 */

import { ErrorCode, ValidationError } from '../types/errors.js';

/**
 * Validate window handle parameter
 * 
 * @param handle - Window handle to validate
 * @throws {ValidationError} If handle is invalid
 */
export function validateWindowHandle(handle: unknown): asserts handle is string {
  if (typeof handle !== 'string') {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: windowHandle must be a string',
      { paramName: 'windowHandle', expectedType: 'string', receivedType: typeof handle }
    );
  }
  
  if (handle.trim() === '') {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: windowHandle cannot be empty',
      { paramName: 'windowHandle' }
    );
  }
  
  // Check if it looks like a numeric window ID
  if (!/^\d+$/.test(handle.trim())) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      `Invalid window handle: ${handle}. Expected numeric window ID. Use list_windows tool to get valid window handles.`,
      { paramName: 'windowHandle', value: handle }
    );
  }
}

/**
 * Validate region coordinates
 * 
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Region width
 * @param height - Region height
 * @throws {ValidationError} If coordinates are invalid
 */
export function validateRegionCoordinates(
  x: unknown,
  y: unknown,
  width: unknown,
  height: unknown
): asserts x is number {
  // Validate x
  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: x must be a finite number',
      { paramName: 'x', expectedType: 'number', receivedType: typeof x }
    );
  }
  
  if (x < 0) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: x must be non-negative',
      { paramName: 'x', value: x }
    );
  }
  
  // Validate y
  if (typeof y !== 'number' || !Number.isFinite(y)) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: y must be a finite number',
      { paramName: 'y', expectedType: 'number', receivedType: typeof y }
    );
  }
  
  if (y < 0) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: y must be non-negative',
      { paramName: 'y', value: y }
    );
  }
  
  // Validate width
  if (typeof width !== 'number' || !Number.isFinite(width)) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: width must be a finite number',
      { paramName: 'width', expectedType: 'number', receivedType: typeof width }
    );
  }
  
  if (width <= 0) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: width must be positive',
      { paramName: 'width', value: width }
    );
  }
  
  // Validate height
  if (typeof height !== 'number' || !Number.isFinite(height)) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: height must be a finite number',
      { paramName: 'height', expectedType: 'number', receivedType: typeof height }
    );
  }
  
  if (height <= 0) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: height must be positive',
      { paramName: 'height', value: height }
    );
  }
}

/**
 * Validate display number
 * 
 * @param display - Display number to validate
 * @returns Validated display number (defaults to 0 if undefined)
 * @throws {ValidationError} If display is invalid
 */
export function validateDisplay(display: unknown): number {
  if (display === undefined || display === null) {
    return 0; // Default to primary display
  }
  
  if (typeof display !== 'number' || !Number.isInteger(display)) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: display must be an integer',
      { paramName: 'display', expectedType: 'integer', receivedType: typeof display }
    );
  }
  
  if (display < 0) {
    throw new ValidationError(
      ErrorCode.INVALID_PARAMS,
      'Invalid parameter: display must be non-negative',
      { paramName: 'display', value: display }
    );
  }
  
  return display;
}
