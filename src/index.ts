#!/usr/bin/env node

/**
 * Screenshot MCP Server
 * 
 * Main entry point for the MCP screenshot server.
 * Provides screenshot capabilities for AI assistants via the Model Context Protocol.
 */

import { MCPServer } from './server/mcp-server.js';
import { PlatformFactory } from './platform/factory.js';
import { WindowScreenshotTool } from './tools/window-screenshot.js';
import { RegionScreenshotTool } from './tools/region-screenshot.js';
import { ListWindowsTool } from './tools/list-windows.js';
import { SaveScreenshotTool } from './tools/save-screenshot.js';
import { CaptureAndSaveTool } from './tools/capture-and-save.js';

/**
 * Initialize and start the MCP server
 */
async function main() {
  try {
    console.error('Starting Screenshot MCP Server...');
    
    // Create platform implementation
    const platform = await PlatformFactory.getPlatform();
    console.error(`Platform: ${process.platform}`);
    
    // Create MCP server
    const server = new MCPServer();
    
    // Register tools
    server.registerTool(new WindowScreenshotTool(platform));
    server.registerTool(new RegionScreenshotTool(platform));
    server.registerTool(new ListWindowsTool(platform));
    server.registerTool(new SaveScreenshotTool());
    server.registerTool(new CaptureAndSaveTool(platform));
    
    console.error('Registered 5 screenshot tools');
    
    // Start server
    await server.start();
    console.error('Server started successfully');
    console.error('Listening for MCP requests on stdin...');
    
    // Handle stdin for JSON-RPC requests
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      
      // Process complete JSON-RPC messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line);
            const response = await server.handleRequest(request);
            console.log(JSON.stringify(response));
          } catch (error) {
            console.error('Error processing request:', error);
            console.log(JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32700,
                message: 'Parse error',
              },
            }));
          }
        }
      }
    });
    
    process.stdin.on('end', async () => {
      console.error('stdin closed, shutting down...');
      await server.stop();
      process.exit(0);
    });
    
    // Handle process signals
    process.on('SIGINT', async () => {
      console.error('\nReceived SIGINT, shutting down...');
      await server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.error('\nReceived SIGTERM, shutting down...');
      await server.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Start the server
main();
