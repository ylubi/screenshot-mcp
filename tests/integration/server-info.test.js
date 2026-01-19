/**
 * Server Info Integration Test
 * 
 * Tests server information and metadata
 */

import { spawn } from 'child_process';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('Server Info', () => {
  let server;

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
        id: 1,
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
          // Ignore parse errors
        }
      };

      server.stdout.on('data', onData);
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  it('should have server description', async () => {
    const response = await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    assert.ok(response.result.serverInfo);
    assert.strictEqual(response.result.serverInfo.name, 'screenshot-mcp');
    assert.strictEqual(response.result.serverInfo.version, '1.0.0');
    assert.ok(response.result.serverInfo.description);
    assert.ok(response.result.serverInfo.description.includes('screenshot'));
    assert.ok(response.result.serverInfo.description.includes('window capture'));
    assert.ok(response.result.serverInfo.description.includes('process name'));
  });
});
