/**
 * Tool Registry
 * 
 * This module manages the registration and discovery of MCP tools.
 * It stores registered tools and provides methods to list and retrieve them.
 */

import { Tool, ToolDefinition } from '../types/index.js';

/**
 * ToolRegistry
 * 
 * Manages tool registration and discovery.
 */
export class ToolRegistry {
  private tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a tool
   * 
   * @param tool - Tool to register
   * @throws Error if a tool with the same name is already registered
   */
  register(tool: Tool): void {
    if (!tool || !tool.definition || !tool.definition.name) {
      throw new Error('Invalid tool: tool must have a definition with a name');
    }

    const name = tool.definition.name;

    if (this.tools.has(name)) {
      throw new Error(`Tool with name "${name}" is already registered`);
    }

    // Validate tool definition
    this.validateToolDefinition(tool.definition);

    this.tools.set(name, tool);
  }

  /**
   * Get all registered tools
   * 
   * @returns Array of tool definitions
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => tool.definition);
  }

  /**
   * Get a tool by name
   * 
   * @param name - Tool name
   * @returns Tool if found, undefined otherwise
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   * 
   * @param name - Tool name
   * @returns True if tool is registered, false otherwise
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get the number of registered tools
   * 
   * @returns Number of registered tools
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Validate tool definition
   * 
   * @param definition - Tool definition to validate
   * @throws Error if definition is invalid
   */
  private validateToolDefinition(definition: ToolDefinition): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('Tool definition must have a name (string)');
    }

    if (!definition.description || typeof definition.description !== 'string') {
      throw new Error('Tool definition must have a description (string)');
    }

    if (!definition.inputSchema || typeof definition.inputSchema !== 'object') {
      throw new Error('Tool definition must have an inputSchema (object)');
    }

    if (!definition.inputSchema.type) {
      throw new Error('Tool inputSchema must have a type');
    }
  }
}
