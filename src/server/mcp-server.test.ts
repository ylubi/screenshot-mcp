/**
 * MCP Server Tests
 * 
 * Unit tests for the MCPServer class.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MCPServer } from './mcp-server.js';
import { Tool, ToolDefinition, ToolResult, JSONRPCRequest } from '../types/index.js';
import { ErrorCode } from '../types/errors.js';

// Mock tool for testing
class MockTool implements Tool {
  definition: ToolDefinition = {
    name: 'mock_tool',
    description: 'A mock tool for testing',
    inputSchema: {
      type: 'object',
      properties: {
        param1: { type: 'string' },
      },
      required: ['param1'],
    },
  };

  async execute(params: any): Promise<ToolResult> {
    if (!params.param1) {
      return {
        success: false,
        error: 'param1 is required',
      };
    }
    return {
      success: true,
      data: { result: `Executed with ${params.param1}` },
    };
  }
}

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('Server Lifecycle', () => {
    it('should start the server', async () => {
      await server.start();
      expect(server.isServerRunning()).toBe(true);
    });

    it('should stop the server', async () => {
      await server.start();
      await server.stop();
      expect(server.isServerRunning()).toBe(false);
    });

    it('should throw error when starting already running server', async () => {
      await server.start();
      await expect(server.start()).rejects.toThrow('Server is already running');
    });

    it('should throw error when stopping non-running server', async () => {
      await expect(server.stop()).rejects.toThrow('Server is not running');
    });
  });

  describe('Tool Registration', () => {
    it('should register a tool', () => {
      const tool = new MockTool();
      server.registerTool(tool);
      // Tool should be registered (verified through handleRequest)
    });
  });

  describe('Request Handling', () => {
    it('should reject request with invalid JSON-RPC version', async () => {
      const request: any = {
        jsonrpc: '1.0',
        id: 1,
        method: 'tools/list',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INVALID_REQUEST);
      expect(response.error?.message).toContain('Invalid JSON-RPC version');
    });

    it('should reject request without ID', async () => {
      const request: any = {
        jsonrpc: '2.0',
        method: 'tools/list',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INVALID_REQUEST);
      expect(response.error?.message).toContain('Request ID is required');
    });

    it('should reject request with unknown method', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'unknown/method',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.METHOD_NOT_FOUND);
      expect(response.error?.message).toContain('Method not found');
    });
  });

  describe('tools/list', () => {
    it('should return empty list when no tools registered', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toEqual([]);
    });

    it('should return list of registered tools', async () => {
      const tool = new MockTool();
      server.registerTool(tool);

      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toHaveLength(1);
      expect(response.result.tools[0].name).toBe('mock_tool');
      expect(response.result.tools[0].description).toBe('A mock tool for testing');
    });
  });

  describe('tools/call', () => {
    beforeEach(() => {
      const tool = new MockTool();
      server.registerTool(tool);
    });

    it('should reject call without params', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      expect(response.error?.message).toContain('params must be an object');
    });

    it('should reject call without tool name', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {},
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INVALID_PARAMS);
      expect(response.error?.message).toContain('name is required');
      expect(response.error?.data?.paramName).toBe('name');
      expect(response.error?.data?.expectedType).toBe('string');
    });

    it('should reject call with non-existent tool', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
          arguments: {},
        },
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.METHOD_NOT_FOUND);
      expect(response.error?.message).toContain('Tool not found');
    });

    it('should execute tool successfully', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'mock_tool',
          arguments: {
            param1: 'test_value',
          },
        },
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.result).toBe('Executed with test_value');
      expect(response.error).toBeUndefined();
    });

    it('should handle tool execution failure', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'mock_tool',
          arguments: {}, // Missing required param1
        },
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.error?.message).toContain('param1 is required');
    });

    it('should handle tool execution with empty arguments', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'mock_tool',
          // No arguments provided
        },
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ErrorCode.INTERNAL_ERROR);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with proper JSON-RPC format', async () => {
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 'test-id',
        method: 'invalid/method',
      };

      const response = await server.handleRequest(request);
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe('test-id');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBeDefined();
      expect(response.error?.message).toBeDefined();
      expect(response.result).toBeUndefined();
    });

    it('should support both string and number IDs', async () => {
      const request1: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 'string-id',
        method: 'tools/list',
      };

      const response1 = await server.handleRequest(request1);
      expect(response1.id).toBe('string-id');

      const request2: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: 42,
        method: 'tools/list',
      };

      const response2 = await server.handleRequest(request2);
      expect(response2.id).toBe(42);
    });
  });
});
