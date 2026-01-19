/**
 * Save Screenshot Tool Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveScreenshotTool } from './save-screenshot.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SaveScreenshotTool', () => {
  let tool: SaveScreenshotTool;
  let testDir: string;

  beforeEach(async () => {
    tool = new SaveScreenshotTool();
    testDir = join(tmpdir(), `screenshot-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Tool Definition', () => {
    it('should have correct tool name', () => {
      expect(tool.definition.name).toBe('save_screenshot');
    });

    it('should have description', () => {
      expect(tool.definition.description).toBeTruthy();
      expect(tool.definition.description.length).toBeGreaterThan(0);
    });

    it('should have required parameters', () => {
      expect(tool.definition.inputSchema.required).toContain('image');
      expect(tool.definition.inputSchema.required).toContain('filePath');
    });

    it('should have image parameter', () => {
      expect(tool.definition.inputSchema.properties.image).toBeDefined();
      expect(tool.definition.inputSchema.properties.image.type).toBe('string');
    });

    it('should have filePath parameter', () => {
      expect(tool.definition.inputSchema.properties.filePath).toBeDefined();
      expect(tool.definition.inputSchema.properties.filePath.type).toBe('string');
    });

    it('should have overwrite parameter', () => {
      expect(tool.definition.inputSchema.properties.overwrite).toBeDefined();
      expect(tool.definition.inputSchema.properties.overwrite.type).toBe('boolean');
    });
  });

  describe('Parameter Validation', () => {
    it('should reject missing image parameter', async () => {
      const result = await tool.execute({
        filePath: join(testDir, 'test.png'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('image');
    });

    it('should reject missing filePath parameter', async () => {
      const result = await tool.execute({
        image: 'base64data',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('filePath');
    });

    it('should reject invalid file extension', async () => {
      const result = await tool.execute({
        image: 'base64data',
        filePath: join(testDir, 'test.jpg'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('extension');
    });

    it('should reject non-string image', async () => {
      const result = await tool.execute({
        image: 123,
        filePath: join(testDir, 'test.png'),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('image');
    });

    it('should reject non-string filePath', async () => {
      const result = await tool.execute({
        image: 'base64data',
        filePath: 123,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('filePath');
    });
  });

  describe('File Operations', () => {
    const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    it('should save valid base64 image', async () => {
      const filePath = join(testDir, 'test.png');
      const result = await tool.execute({
        image: validBase64,
        filePath,
      });

      expect(result.success).toBe(true);
      expect(result.data.saved).toBe(true);
      expect(result.data.filePath).toBe(filePath);
      expect(result.data.fileSize).toBeGreaterThan(0);

      // Verify file exists
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
    });

    it('should create directory if it does not exist', async () => {
      const filePath = join(testDir, 'subdir', 'test.png');
      const result = await tool.execute({
        image: validBase64,
        filePath,
      });

      expect(result.success).toBe(true);
      
      // Verify directory was created
      const stats = await fs.stat(join(testDir, 'subdir'));
      expect(stats.isDirectory()).toBe(true);
    });

    it('should reject overwriting existing file by default', async () => {
      const filePath = join(testDir, 'test.png');
      
      // Create file first
      await tool.execute({
        image: validBase64,
        filePath,
      });

      // Try to save again without overwrite
      const result = await tool.execute({
        image: validBase64,
        filePath,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should overwrite existing file when overwrite=true', async () => {
      const filePath = join(testDir, 'test.png');
      
      // Create file first
      await tool.execute({
        image: validBase64,
        filePath,
      });

      // Save again with overwrite
      const result = await tool.execute({
        image: validBase64,
        filePath,
        overwrite: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.saved).toBe(true);
    });

    it('should handle nested directories', async () => {
      const filePath = join(testDir, 'a', 'b', 'c', 'test.png');
      const result = await tool.execute({
        image: validBase64,
        filePath,
      });

      expect(result.success).toBe(true);
      
      // Verify file exists
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
    });

    it('should return correct file size', async () => {
      const filePath = join(testDir, 'test.png');
      const result = await tool.execute({
        image: validBase64,
        filePath,
      });

      expect(result.success).toBe(true);
      
      const stats = await fs.stat(filePath);
      expect(result.data.fileSize).toBe(stats.size);
    });
  });
});
