/**
 * MCP Server
 * 
 * This module implements the core MCP (Model Context Protocol) server
 * that handles JSON-RPC 2.0 communication, tool registration, and request routing.
 */

import {
  JSONRPCRequest,
  JSONRPCResponse,
  Tool,
} from '../types/index.js';
import { ErrorCode, ScreenshotError } from '../types/errors.js';
import { ToolRegistry } from './tool-registry.js';

/**
 * MCPServer
 * 
 * Main server class that implements the MCP protocol.
 * Handles tool registration, request routing, and response formatting.
 */
export class MCPServer {
  private toolRegistry: ToolRegistry;
  private isRunning: boolean = false;
  private serverInfo = {
    name: 'screenshot-mcp',
    version: '1.1.0',
    description: 'Screenshot MCP Server - Provides screenshot capabilities for AI assistants. Supports window capture (by handle/title/process name), region capture, long screenshot with auto-scroll (via longScreenshot parameter), and direct file saving. Cross-platform support for Windows, macOS, and Linux.',
  };

  constructor() {
    this.toolRegistry = new ToolRegistry();
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }
    this.isRunning = true;
    console.log('MCP Server started');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Server is not running');
    }
    this.isRunning = false;
    console.log('MCP Server stopped');
  }

  /**
   * Register a tool with the server
   * 
   * @param tool - Tool to register
   */
  registerTool(tool: Tool): void {
    this.toolRegistry.register(tool);
  }

  /**
   * Handle a JSON-RPC 2.0 request
   * 
   * @param request - JSON-RPC request object
   * @returns JSON-RPC response object
   */
  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    // Validate JSON-RPC version
    if (request.jsonrpc !== '2.0') {
      return this.createErrorResponse(
        request.id,
        ErrorCode.INVALID_REQUEST,
        'Invalid JSON-RPC version, must be "2.0"'
      );
    }

    // Validate request ID
    if (request.id === undefined || request.id === null) {
      return this.createErrorResponse(
        0,
        ErrorCode.INVALID_REQUEST,
        'Request ID is required'
      );
    }

    // Route the request based on method
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        
        case 'tools/list':
          return this.handleListTools(request);
        
        case 'tools/call':
          return await this.handleToolCall(request);
        
        default:
          return this.createErrorResponse(
            request.id,
            ErrorCode.METHOD_NOT_FOUND,
            `Method not found: ${request.method}`
          );
      }
    } catch (error) {
      return this.handleError(request.id, error);
    }
  }

  /**
   * Handle initialize request
   * 
   * @param request - JSON-RPC request
   * @returns JSON-RPC response with server capabilities
   */
  private handleInitialize(request: JSONRPCRequest): JSONRPCResponse {
    return this.createSuccessResponse(request.id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: this.serverInfo,
    });
  }

  /**
   * Handle tools/list request
   * 
   * @param request - JSON-RPC request
   * @returns JSON-RPC response with list of tools
   */
  private handleListTools(request: JSONRPCRequest): JSONRPCResponse {
    const tools = this.toolRegistry.listTools();
    return this.createSuccessResponse(request.id, { tools });
  }

  /**
   * Handle tools/call request
   * 
   * @param request - JSON-RPC request
   * @returns JSON-RPC response with tool execution result
   */
  private async handleToolCall(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    // Validate params
    if (!request.params || typeof request.params !== 'object') {
      return this.createErrorResponse(
        request.id,
        ErrorCode.INVALID_PARAMS,
        'Invalid params: params must be an object'
      );
    }

    const { name, arguments: toolArgs } = request.params;

    // Validate tool name
    if (!name || typeof name !== 'string') {
      return this.createErrorResponse(
        request.id,
        ErrorCode.INVALID_PARAMS,
        'Invalid params: name is required and must be a string',
        { paramName: 'name', expectedType: 'string' }
      );
    }

    console.error(`[MCP] Calling tool: ${name}`);

    // Get the tool
    const tool = this.toolRegistry.getTool(name);
    if (!tool) {
      return this.createErrorResponse(
        request.id,
        ErrorCode.METHOD_NOT_FOUND,
        `Tool not found: ${name}`
      );
    }

    // Execute the tool
    try {
      console.error(`[MCP] Executing tool with args:`, JSON.stringify(toolArgs || {}).substring(0, 100));
      const result = await tool.execute(toolArgs || {});
      
      if (result.success) {
        // Log result size for debugging
        const resultStr = JSON.stringify(result.data);
        console.error(`[MCP] Tool execution successful, result size: ${resultStr.length} bytes`);
        
        return this.createSuccessResponse(request.id, result.data);
      } else {
        console.error(`[MCP] Tool execution failed:`, result.error);
        return this.createErrorResponse(
          request.id,
          ErrorCode.INTERNAL_ERROR,
          result.error || 'Tool execution failed'
        );
      }
    } catch (error) {
      console.error(`[MCP] Tool execution error:`, error);
      return this.handleError(request.id, error);
    }
  }

  /**
   * Create a success response
   * 
   * @param id - Request ID
   * @param result - Result data
   * @returns JSON-RPC success response
   */
  private createSuccessResponse(id: string | number, result: any): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  /**
   * Create an error response
   * 
   * @param id - Request ID
   * @param code - Error code
   * @param message - Error message
   * @param data - Optional error data
   * @returns JSON-RPC error response
   */
  private createErrorResponse(
    id: string | number,
    code: number,
    message: string,
    data?: any
  ): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        data,
      },
    };
  }

  /**
   * Handle errors and convert them to JSON-RPC error responses
   * 
   * @param id - Request ID
   * @param error - Error object
   * @returns JSON-RPC error response
   */
  private handleError(id: string | number, error: any): JSONRPCResponse {
    // Handle ScreenshotError
    if (error instanceof ScreenshotError) {
      return this.createErrorResponse(
        id,
        error.code,
        error.message,
        error.details
      );
    }

    // Handle generic errors
    console.error('Unexpected error:', error);
    return this.createErrorResponse(
      id,
      ErrorCode.INTERNAL_ERROR,
      error.message || 'Internal server error',
      { originalError: error.toString() }
    );
  }

  /**
   * Check if the server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }
}
