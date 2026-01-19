/**
 * Type Validation Tests
 * 
 * Basic tests to ensure type definitions are correct and usable.
 */

import { describe, it, expect } from 'vitest';
import type {
  JSONRPCRequest,
  JSONRPCResponse,
  Tool,
  ToolDefinition,
  ToolResult
} from './mcp.js';
import type {
  WindowScreenshotParams,
  RegionScreenshotParams,
  ScreenshotResult,
  WindowInfo
} from './screenshot.js';
import {
  ErrorCode,
  ScreenshotError,
  ValidationError,
  PlatformError
} from './errors.js';

describe('MCP Types', () => {
  it('should create valid JSONRPCRequest', () => {
    const request: JSONRPCRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "test_method",
      params: { test: "value" }
    };
    
    expect(request.jsonrpc).toBe("2.0");
    expect(request.id).toBe(1);
    expect(request.method).toBe("test_method");
  });

  it('should create valid JSONRPCResponse with result', () => {
    const response: JSONRPCResponse = {
      jsonrpc: "2.0",
      id: 1,
      result: { success: true }
    };
    
    expect(response.jsonrpc).toBe("2.0");
    expect(response.result).toEqual({ success: true });
  });

  it('should create valid JSONRPCResponse with error', () => {
    const response: JSONRPCResponse = {
      jsonrpc: "2.0",
      id: 1,
      error: {
        code: -32602,
        message: "Invalid params"
      }
    };
    
    expect(response.error?.code).toBe(-32602);
    expect(response.error?.message).toBe("Invalid params");
  });

  it('should create valid ToolDefinition', () => {
    const definition: ToolDefinition = {
      name: "test_tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string" }
        },
        required: ["param1"]
      }
    };
    
    expect(definition.name).toBe("test_tool");
    expect(definition.inputSchema.type).toBe("object");
  });
});

describe('Screenshot Types', () => {
  it('should create valid WindowScreenshotParams', () => {
    const params: WindowScreenshotParams = {
      windowHandle: "12345",
      includeFrame: true
    };
    
    expect(params.windowHandle).toBe("12345");
    expect(params.includeFrame).toBe(true);
  });

  it('should create valid RegionScreenshotParams', () => {
    const params: RegionScreenshotParams = {
      x: 100,
      y: 200,
      width: 800,
      height: 600,
      display: 0
    };
    
    expect(params.x).toBe(100);
    expect(params.width).toBe(800);
  });

  it('should create valid ScreenshotResult', () => {
    const result: ScreenshotResult = {
      image: "base64data",
      mimeType: "image/png",
      width: 800,
      height: 600,
      timestamp: new Date().toISOString()
    };
    
    expect(result.mimeType).toBe("image/png");
    expect(result.width).toBe(800);
  });

  it('should create valid WindowInfo', () => {
    const info: WindowInfo = {
      handle: "12345",
      title: "Test Window",
      processName: "test.exe",
      bounds: { x: 0, y: 0, width: 800, height: 600 }
    };
    
    expect(info.title).toBe("Test Window");
    expect(info.bounds.width).toBe(800);
  });
});

describe('Error Types', () => {
  it('should create ScreenshotError with correct properties', () => {
    const error = new ScreenshotError(
      ErrorCode.WINDOW_NOT_FOUND,
      "Window not found",
      { handle: "0x12345" }
    );
    
    expect(error.code).toBe(ErrorCode.WINDOW_NOT_FOUND);
    expect(error.message).toBe("Window not found");
    expect(error.details).toEqual({ handle: "0x12345" });
    expect(error.name).toBe("ScreenshotError");
  });

  it('should convert ScreenshotError to JSON-RPC error', () => {
    const error = new ScreenshotError(
      ErrorCode.CAPTURE_FAILED,
      "Capture failed"
    );
    
    const jsonError = error.toJSONRPCError();
    
    expect(jsonError.code).toBe(ErrorCode.CAPTURE_FAILED);
    expect(jsonError.message).toBe("Capture failed");
  });

  it('should create ValidationError', () => {
    const error = new ValidationError(ErrorCode.INVALID_PARAMS, "Invalid parameter");
    
    expect(error.code).toBe(ErrorCode.INVALID_PARAMS);
    expect(error.name).toBe("ValidationError");
  });

  it('should create PlatformError', () => {
    const error = new PlatformError(
      ErrorCode.PLATFORM_NOT_SUPPORTED,
      "Platform not supported"
    );
    
    expect(error.code).toBe(ErrorCode.PLATFORM_NOT_SUPPORTED);
    expect(error.name).toBe("PlatformError");
  });

  it('should have all required error codes', () => {
    expect(ErrorCode.PARSE_ERROR).toBe(-32700);
    expect(ErrorCode.INVALID_REQUEST).toBe(-32600);
    expect(ErrorCode.METHOD_NOT_FOUND).toBe(-32601);
    expect(ErrorCode.INVALID_PARAMS).toBe(-32602);
    expect(ErrorCode.INTERNAL_ERROR).toBe(-32603);
    
    expect(ErrorCode.WINDOW_NOT_FOUND).toBe(1001);
    expect(ErrorCode.REGION_OUT_OF_BOUNDS).toBe(1002);
    expect(ErrorCode.PERMISSION_DENIED).toBe(1003);
    expect(ErrorCode.CAPTURE_FAILED).toBe(1004);
    expect(ErrorCode.PLATFORM_NOT_SUPPORTED).toBe(1005);
  });
});
