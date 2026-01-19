/**
 * Error Types and Codes
 * 
 * This module defines error codes and custom error classes
 * for the screenshot MCP server.
 */

/**
 * Error Codes
 * 
 * Standard JSON-RPC 2.0 error codes and application-specific error codes.
 */
export enum ErrorCode {
  // JSON-RPC 2.0 Standard Error Codes
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // Application-Specific Error Codes (1000+)
  WINDOW_NOT_FOUND = 1001,
  REGION_OUT_OF_BOUNDS = 1002,
  PERMISSION_DENIED = 1003,
  CAPTURE_FAILED = 1004,
  PLATFORM_NOT_SUPPORTED = 1005,
}

/**
 * Screenshot Error
 * 
 * Custom error class for screenshot operations.
 */
export class ScreenshotError extends Error {
  /**
   * Creates a new ScreenshotError
   * 
   * @param code - Error code from ErrorCode enum
   * @param message - Human-readable error message
   * @param details - Optional additional error details
   */
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ScreenshotError';
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScreenshotError);
    }
  }

  /**
   * Converts the error to a JSON-RPC error object
   */
  toJSONRPCError() {
    return {
      code: this.code,
      message: this.message,
      data: this.details
    };
  }
}

/**
 * Validation Error
 * 
 * Error thrown when input validation fails.
 */
export class ValidationError extends ScreenshotError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Platform Error
 * 
 * Error thrown when platform-specific operations fail.
 */
export class PlatformError extends ScreenshotError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, details);
    this.name = 'PlatformError';
  }
}
