/**
 * MCP Protocol Types
 * 
 * This module defines the core types for the Model Context Protocol (MCP)
 * including JSON-RPC 2.0 message formats and tool definitions.
 */

/**
 * JSON-RPC 2.0 Request
 * 
 * Represents a request message in the JSON-RPC 2.0 protocol.
 */
export interface JSONRPCRequest {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: "2.0";
  
  /** Request identifier, can be string or number */
  id: string | number;
  
  /** Method name to invoke */
  method: string;
  
  /** Optional parameters for the method */
  params?: any;
}

/**
 * JSON-RPC 2.0 Response
 * 
 * Represents a response message in the JSON-RPC 2.0 protocol.
 * Either result or error must be present, but not both.
 */
export interface JSONRPCResponse {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: "2.0";
  
  /** Request identifier matching the request */
  id: string | number;
  
  /** Result data if successful */
  result?: any;
  
  /** Error information if failed */
  error?: JSONRPCError;
}

/**
 * JSON-RPC 2.0 Error
 * 
 * Represents an error in the JSON-RPC 2.0 protocol.
 */
export interface JSONRPCError {
  /** Error code */
  code: number;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional additional error data */
  data?: any;
}

/**
 * Tool Definition
 * 
 * Defines the metadata and schema for an MCP tool.
 */
export interface ToolDefinition {
  /** Unique tool name */
  name: string;
  
  /** Human-readable description of what the tool does */
  description: string;
  
  /** JSON Schema defining the input parameters */
  inputSchema: JSONSchema;
}

/**
 * JSON Schema
 * 
 * Simplified JSON Schema definition for tool parameters.
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Tool Interface
 * 
 * Interface that all MCP tools must implement.
 */
export interface Tool {
  /** Tool metadata and schema */
  definition: ToolDefinition;
  
  /** Execute the tool with given parameters */
  execute(params: any): Promise<ToolResult>;
}

/**
 * Tool Result
 * 
 * Result returned by tool execution.
 */
export interface ToolResult {
  /** Whether the execution was successful */
  success: boolean;
  
  /** Result data if successful */
  data?: any;
  
  /** Error message if failed */
  error?: string;
}
