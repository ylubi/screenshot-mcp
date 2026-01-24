/**
 * Windows Platform Tests
 * 
 * Unit tests for Windows platform screenshot implementation.
 * Tests basic screenshot functionality and window listing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WindowsPlatform } from './windows.js';
import { ErrorCode, PlatformError } from '../types/errors.js';

const describeWindows = process.platform === 'win32' ? describe : describe.skip;

describeWindows('WindowsPlatform', () => {
  let platform: WindowsPlatform;

  beforeEach(() => {
    platform = new WindowsPlatform();
  });

  describe('captureWindow', () => {
    it('should reject invalid window handle (non-numeric)', async () => {
      await expect(
        platform.captureWindow('invalid-handle', true)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureWindow('invalid-handle', true)
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_PARAMS
      });
    });

    it('should reject non-existent window ID', async () => {
      // Use a very large window ID that is unlikely to exist
      const nonExistentId = '999999999';
      
      await expect(
        platform.captureWindow(nonExistentId, true)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureWindow(nonExistentId, true)
      ).rejects.toMatchObject({
        code: ErrorCode.WINDOW_NOT_FOUND
      });
    });

    it('should capture window screenshot with valid window ID', async () => {
      // Get a valid window from the list
      const windows = await platform.listWindows(false);
      
      if (windows.length === 0) {
        console.warn('No windows available for testing, skipping test');
        return;
      }

      const firstWindow = windows[0];
      const imageBuffer = await platform.captureWindow(firstWindow.handle, true);

      // Verify image buffer structure
      expect(imageBuffer).toBeDefined();
      expect(imageBuffer.data).toBeInstanceOf(Buffer);
      expect(imageBuffer.width).toBeGreaterThan(0);
      expect(imageBuffer.height).toBeGreaterThan(0);
      expect(imageBuffer.format).toBe('RGBA');
    });
  });

  describe('captureRegion', () => {
    it('should reject negative coordinates', async () => {
      await expect(
        platform.captureRegion(-10, 0, 100, 100, 0)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureRegion(-10, 0, 100, 100, 0)
      ).rejects.toMatchObject({
        code: ErrorCode.REGION_OUT_OF_BOUNDS
      });
    });

    it('should reject zero or negative width', async () => {
      await expect(
        platform.captureRegion(0, 0, 0, 100, 0)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureRegion(0, 0, -100, 100, 0)
      ).rejects.toThrow(PlatformError);
    });

    it('should reject zero or negative height', async () => {
      await expect(
        platform.captureRegion(0, 0, 100, 0, 0)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureRegion(0, 0, 100, -100, 0)
      ).rejects.toThrow(PlatformError);
    });

    it('should reject region exceeding monitor bounds', async () => {
      const displays = await platform.getDisplayInfo();
      
      if (displays.length === 0) {
        console.warn('No displays available for testing, skipping test');
        return;
      }

      const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
      
      // Try to capture a region that exceeds the monitor bounds
      await expect(
        platform.captureRegion(
          0, 
          0, 
          primaryDisplay.bounds.width + 1000, 
          primaryDisplay.bounds.height + 1000, 
          0
        )
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureRegion(
          0, 
          0, 
          primaryDisplay.bounds.width + 1000, 
          primaryDisplay.bounds.height + 1000, 
          0
        )
      ).rejects.toMatchObject({
        code: ErrorCode.REGION_OUT_OF_BOUNDS
      });
    });

    it('should reject invalid display number', async () => {
      const displays = await platform.getDisplayInfo();
      const invalidDisplay = displays.length + 10;

      await expect(
        platform.captureRegion(0, 0, 100, 100, invalidDisplay)
      ).rejects.toThrow(PlatformError);

      await expect(
        platform.captureRegion(0, 0, 100, 100, invalidDisplay)
      ).rejects.toMatchObject({
        code: ErrorCode.REGION_OUT_OF_BOUNDS
      });
    });

    it('should capture valid screen region', async () => {
      // Capture a small region from the top-left corner
      const imageBuffer = await platform.captureRegion(0, 0, 100, 100, 0);

      // Verify image buffer structure
      expect(imageBuffer).toBeDefined();
      expect(imageBuffer.data).toBeInstanceOf(Buffer);
      expect(imageBuffer.width).toBe(100);
      expect(imageBuffer.height).toBe(100);
      expect(imageBuffer.format).toBe('RGBA');
    });

    it('should capture region with correct dimensions', async () => {
      const width = 200;
      const height = 150;
      
      const imageBuffer = await platform.captureRegion(10, 10, width, height, 0);

      expect(imageBuffer.width).toBe(width);
      expect(imageBuffer.height).toBe(height);
    });
  });

  describe('listWindows', () => {
    it('should return array of windows', async () => {
      const windows = await platform.listWindows(false);

      expect(Array.isArray(windows)).toBe(true);
      // Note: We can't guarantee windows exist, but the call should succeed
    });

    it('should return windows with required fields', async () => {
      const windows = await platform.listWindows(false);

      if (windows.length > 0) {
        const window = windows[0];
        
        expect(window).toHaveProperty('handle');
        expect(window).toHaveProperty('title');
        expect(window).toHaveProperty('processName');
        expect(window).toHaveProperty('bounds');
        
        expect(typeof window.handle).toBe('string');
        expect(typeof window.title).toBe('string');
        expect(typeof window.processName).toBe('string');
        
        expect(window.bounds).toHaveProperty('x');
        expect(window.bounds).toHaveProperty('y');
        expect(window.bounds).toHaveProperty('width');
        expect(window.bounds).toHaveProperty('height');
      }
    });

    it('should filter out minimized windows when includeMinimized is false', async () => {
      const windowsWithoutMinimized = await platform.listWindows(false);
      const windowsWithMinimized = await platform.listWindows(true);

      // Windows with minimized should have >= windows without minimized
      expect(windowsWithMinimized.length).toBeGreaterThanOrEqual(windowsWithoutMinimized.length);
    });

    it('should return sorted windows by title', async () => {
      const windows = await platform.listWindows(false);

      if (windows.length > 1) {
        // Check if windows are sorted by title (case-insensitive)
        for (let i = 0; i < windows.length - 1; i++) {
          const currentTitle = windows[i].title.toLowerCase();
          const nextTitle = windows[i + 1].title.toLowerCase();
          expect(currentTitle.localeCompare(nextTitle)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('should not include windows with empty titles', async () => {
      const windows = await platform.listWindows(true);

      for (const window of windows) {
        expect(window.title.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('getDisplayInfo', () => {
    it('should return array of displays', async () => {
      const displays = await platform.getDisplayInfo();

      expect(Array.isArray(displays)).toBe(true);
      expect(displays.length).toBeGreaterThan(0);
    });

    it('should return displays with required fields', async () => {
      const displays = await platform.getDisplayInfo();

      expect(displays.length).toBeGreaterThan(0);
      
      const display = displays[0];
      
      expect(display).toHaveProperty('id');
      expect(display).toHaveProperty('bounds');
      expect(display).toHaveProperty('isPrimary');
      
      expect(typeof display.id).toBe('number');
      expect(typeof display.isPrimary).toBe('boolean');
      
      expect(display.bounds).toHaveProperty('x');
      expect(display.bounds).toHaveProperty('y');
      expect(display.bounds).toHaveProperty('width');
      expect(display.bounds).toHaveProperty('height');
      
      expect(display.bounds.width).toBeGreaterThan(0);
      expect(display.bounds.height).toBeGreaterThan(0);
    });

    it('should have at least one primary display', async () => {
      const displays = await platform.getDisplayInfo();

      const primaryDisplays = displays.filter(d => d.isPrimary);
      expect(primaryDisplays.length).toBeGreaterThanOrEqual(1);
    });
  });
});
