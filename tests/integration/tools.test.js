/**
 * Tools Integration Test
 * 
 * Tests all screenshot tools functionality
 */

import { spawn } from 'child_process';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('Screenshot Tools Integration', () => {
  let server;
  let requestId = 1;

  before(() => {
    server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to start
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
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
      }, 10000);

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

  it('should verify capture_window tool has processName parameter', async () => {
    const response = await sendRequest('tools/list');
    
    const captureWindow = response.result.tools.find(t => t.name === 'capture_window');
    assert.ok(captureWindow);
    assert.ok(captureWindow.inputSchema.properties.processName);
    assert.ok(captureWindow.inputSchema.properties.windowTitle);
    assert.ok(captureWindow.inputSchema.properties.windowHandle);
  });

  it('should verify capture_and_save tool has processName parameter', async () => {
    const response = await sendRequest('tools/list');
    
    const captureAndSave = response.result.tools.find(t => t.name === 'capture_and_save');
    assert.ok(captureAndSave);
    assert.ok(captureAndSave.inputSchema.properties.processName);
    assert.ok(captureAndSave.inputSchema.properties.windowTitle);
    assert.ok(captureAndSave.inputSchema.properties.windowHandle);
  });

  it('should verify all tools have proper descriptions', async () => {
    const response = await sendRequest('tools/list');
    
    for (const tool of response.result.tools) {
      assert.ok(tool.description);
      assert.ok(tool.description.length > 50);
    }
  });

  it('should verify capture_window mentions save functionality', async () => {
    const response = await sendRequest('tools/list');
    
    const captureWindow = response.result.tools.find(t => t.name === 'capture_window');
    assert.ok(captureWindow.description.includes('capture_and_save'));
  });

  it('should verify capture_region mentions save functionality', async () => {
    const response = await sendRequest('tools/list');
    
    const captureRegion = response.result.tools.find(t => t.name === 'capture_region');
    assert.ok(captureRegion.description.includes('capture_and_save'));
  });
});
