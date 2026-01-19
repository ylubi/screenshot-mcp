/**
 * MCP Protocol Integration Test
 * 
 * Tests the complete MCP protocol flow: initialize, tools/list, tools/call
 */

import { spawn } from 'child_process';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('MCP Protocol Integration', () => {
  let server;
  let requestId = 1;

  before(() => {
    server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  });

  after(() => {
    if (server) {
      server.kill();
    }
  });

  function sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: requestId++,
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      const onData = (data) => {
        try {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim() && line.includes('"jsonrpc"')) {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                clearTimeout(timeout);
                server.stdout.off('data', onData);
                resolve(response);
              }
            }
          }
        } catch (error) {
          // Ignore parse errors for non-JSON lines
        }
      };

      server.stdout.on('data', onData);
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  it('should initialize successfully', async () => {
    const response = await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    assert.strictEqual(response.jsonrpc, '2.0');
    assert.ok(response.result);
    assert.strictEqual(response.result.protocolVersion, '2024-11-05');
    assert.ok(response.result.serverInfo);
    assert.strictEqual(response.result.serverInfo.name, 'screenshot-mcp');
  });

  it('should list tools', async () => {
    const response = await sendRequest('tools/list');

    assert.strictEqual(response.jsonrpc, '2.0');
    assert.ok(response.result);
    assert.ok(Array.isArray(response.result.tools));
    assert.strictEqual(response.result.tools.length, 5);

    const toolNames = response.result.tools.map(t => t.name);
    assert.ok(toolNames.includes('capture_window'));
    assert.ok(toolNames.includes('capture_region'));
    assert.ok(toolNames.includes('list_windows'));
    assert.ok(toolNames.includes('save_screenshot'));
    assert.ok(toolNames.includes('capture_and_save'));
  });

  it('should call list_windows tool', async () => {
    const response = await sendRequest('tools/call', {
      name: 'list_windows',
      arguments: {}
    });

    assert.strictEqual(response.jsonrpc, '2.0');
    // Tool call should return either result or error
    assert.ok(response.result || response.error);
  });
});
