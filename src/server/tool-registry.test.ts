/**
 * Tool Registry Tests
 * 
 * Unit tests for the ToolRegistry class.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from './tool-registry.js';
import { Tool, ToolDefinition, ToolResult } from '../types/index.js';

// Mock tool for testing
class MockTool implements Tool {
  definition: ToolDefinition;

  constructor(name: string, description: string = 'Mock tool') {
    this.definition = {
      name,
      description,
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };
  }

  async execute(params: any): Promise<ToolResult> {
    return {
      success: true,
      data: { executed: true },
    };
  }
}

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('Tool Registration', () => {
    it('should register a tool successfully', () => {
      const tool = new MockTool('test_tool');
      registry.register(tool);
      
      expect(registry.hasTool('test_tool')).toBe(true);
      expect(registry.count()).toBe(1);
    });

    it('should register multiple tools', () => {
      const tool1 = new MockTool('tool1');
      const tool2 = new MockTool('tool2');
      const tool3 = new MockTool('tool3');

      registry.register(tool1);
      registry.register(tool2);
      registry.register(tool3);

      expect(registry.count()).toBe(3);
      expect(registry.hasTool('tool1')).toBe(true);
      expect(registry.hasTool('tool2')).toBe(true);
      expect(registry.hasTool('tool3')).toBe(true);
    });

    it('should throw error when registering duplicate tool', () => {
      const tool1 = new MockTool('duplicate_tool');
      const tool2 = new MockTool('duplicate_tool');

      registry.register(tool1);
      
      expect(() => registry.register(tool2)).toThrow(
        'Tool with name "duplicate_tool" is already registered'
      );
    });

    it('should throw error when registering invalid tool', () => {
      expect(() => registry.register(null as any)).toThrow('Invalid tool');
      expect(() => registry.register({} as any)).toThrow('Invalid tool');
      expect(() => registry.register({ definition: {} } as any)).toThrow('Invalid tool');
    });

    it('should throw error when tool definition has no name', () => {
      const invalidTool = {
        definition: {
          description: 'Test',
          inputSchema: { type: 'object' },
        },
        execute: async () => ({ success: true }),
      } as any;

      expect(() => registry.register(invalidTool)).toThrow(
        'Invalid tool: tool must have a definition with a name'
      );
    });

    it('should throw error when tool definition has no description', () => {
      const invalidTool = {
        definition: {
          name: 'test',
          inputSchema: { type: 'object' },
        },
        execute: async () => ({ success: true }),
      } as any;

      expect(() => registry.register(invalidTool)).toThrow(
        'Tool definition must have a description'
      );
    });

    it('should throw error when tool definition has no inputSchema', () => {
      const invalidTool = {
        definition: {
          name: 'test',
          description: 'Test',
        },
        execute: async () => ({ success: true }),
      } as any;

      expect(() => registry.register(invalidTool)).toThrow(
        'Tool definition must have an inputSchema'
      );
    });

    it('should throw error when inputSchema has no type', () => {
      const invalidTool = {
        definition: {
          name: 'test',
          description: 'Test',
          inputSchema: {},
        },
        execute: async () => ({ success: true }),
      } as any;

      expect(() => registry.register(invalidTool)).toThrow(
        'Tool inputSchema must have a type'
      );
    });
  });

  describe('Tool Listing', () => {
    it('should return empty array when no tools registered', () => {
      const tools = registry.listTools();
      expect(tools).toEqual([]);
    });

    it('should return all registered tool definitions', () => {
      const tool1 = new MockTool('tool1', 'First tool');
      const tool2 = new MockTool('tool2', 'Second tool');

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.listTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('tool1');
      expect(tools[0].description).toBe('First tool');
      expect(tools[1].name).toBe('tool2');
      expect(tools[1].description).toBe('Second tool');
    });

    it('should return tool definitions not tool instances', () => {
      const tool = new MockTool('test_tool');
      registry.register(tool);

      const tools = registry.listTools();
      expect(tools[0]).toEqual(tool.definition);
      expect(tools[0]).not.toBe(tool);
    });
  });

  describe('Tool Retrieval', () => {
    it('should retrieve registered tool by name', () => {
      const tool = new MockTool('test_tool');
      registry.register(tool);

      const retrieved = registry.getTool('test_tool');
      expect(retrieved).toBe(tool);
    });

    it('should return undefined for non-existent tool', () => {
      const retrieved = registry.getTool('non_existent');
      expect(retrieved).toBeUndefined();
    });

    it('should check if tool exists', () => {
      const tool = new MockTool('test_tool');
      registry.register(tool);

      expect(registry.hasTool('test_tool')).toBe(true);
      expect(registry.hasTool('non_existent')).toBe(false);
    });
  });

  describe('Tool Count', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.count()).toBe(0);
    });

    it('should return correct count after registrations', () => {
      expect(registry.count()).toBe(0);

      registry.register(new MockTool('tool1'));
      expect(registry.count()).toBe(1);

      registry.register(new MockTool('tool2'));
      expect(registry.count()).toBe(2);

      registry.register(new MockTool('tool3'));
      expect(registry.count()).toBe(3);
    });
  });

  describe('Clear Registry', () => {
    it('should clear all registered tools', () => {
      registry.register(new MockTool('tool1'));
      registry.register(new MockTool('tool2'));
      registry.register(new MockTool('tool3'));

      expect(registry.count()).toBe(3);

      registry.clear();

      expect(registry.count()).toBe(0);
      expect(registry.listTools()).toEqual([]);
      expect(registry.hasTool('tool1')).toBe(false);
    });

    it('should allow re-registration after clear', () => {
      const tool = new MockTool('test_tool');
      registry.register(tool);
      registry.clear();

      // Should not throw error
      registry.register(tool);
      expect(registry.count()).toBe(1);
    });
  });
});
