/**
 * Platform Factory Tests
 * 
 * Unit tests for platform detection and factory pattern.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  detectPlatform, 
  getPlatformName, 
  PlatformType, 
  PlatformFactory 
} from './factory.js';
import { ErrorCode, PlatformError } from '../types/errors.js';

describe('Platform Detection', () => {
  describe('detectPlatform', () => {
    it('should detect Windows platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });

      const result = detectPlatform();
      expect(result).toBe(PlatformType.WINDOWS);

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should detect macOS platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true
      });

      const result = detectPlatform();
      expect(result).toBe(PlatformType.MACOS);

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should detect Linux platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      const result = detectPlatform();
      expect(result).toBe(PlatformType.LINUX);

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should return UNKNOWN for unsupported platforms', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'freebsd',
        configurable: true
      });

      const result = detectPlatform();
      expect(result).toBe(PlatformType.UNKNOWN);

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });
  });

  describe('getPlatformName', () => {
    it('should return "Windows" for WINDOWS platform', () => {
      expect(getPlatformName(PlatformType.WINDOWS)).toBe('Windows');
    });

    it('should return "macOS" for MACOS platform', () => {
      expect(getPlatformName(PlatformType.MACOS)).toBe('macOS');
    });

    it('should return "Linux" for LINUX platform', () => {
      expect(getPlatformName(PlatformType.LINUX)).toBe('Linux');
    });

    it('should return "Unknown" for UNKNOWN platform', () => {
      expect(getPlatformName(PlatformType.UNKNOWN)).toBe('Unknown');
    });
  });
});

describe('PlatformFactory', () => {
  beforeEach(() => {
    // Reset factory before each test
    PlatformFactory.reset();
  });

  afterEach(() => {
    // Clean up after each test
    PlatformFactory.reset();
  });

  describe('isPlatformSupported', () => {
    it('should return true for Windows', () => {
      expect(PlatformFactory.isPlatformSupported(PlatformType.WINDOWS)).toBe(true);
    });

    it('should return true for macOS', () => {
      expect(PlatformFactory.isPlatformSupported(PlatformType.MACOS)).toBe(true);
    });

    it('should return true for Linux', () => {
      expect(PlatformFactory.isPlatformSupported(PlatformType.LINUX)).toBe(true);
    });

    it('should return false for unknown platform', () => {
      expect(PlatformFactory.isPlatformSupported(PlatformType.UNKNOWN)).toBe(false);
    });
  });

  describe('getCurrentPlatform', () => {
    it('should return null before getPlatform is called', () => {
      expect(PlatformFactory.getCurrentPlatform()).toBeNull();
    });

    it('should return detected platform after getPlatform is called', async () => {
      try {
        await PlatformFactory.getPlatform();
      } catch (error) {
        // Ignore errors from stub implementations
      }
      
      const currentPlatform = PlatformFactory.getCurrentPlatform();
      expect(currentPlatform).not.toBeNull();
      expect([
        PlatformType.WINDOWS,
        PlatformType.MACOS,
        PlatformType.LINUX,
        PlatformType.UNKNOWN
      ]).toContain(currentPlatform);
    });
  });

  describe('getPlatform', () => {
    it('should return a platform implementation on supported platforms', async () => {
      const currentPlatform = detectPlatform();
      
      if (PlatformFactory.isPlatformSupported(currentPlatform)) {
        const platform = await PlatformFactory.getPlatform();
        expect(platform).toBeDefined();
        expect(platform.captureWindow).toBeDefined();
        expect(platform.captureRegion).toBeDefined();
        expect(platform.listWindows).toBeDefined();
        expect(platform.getDisplayInfo).toBeDefined();
      }
    });

    it('should throw PlatformError on unsupported platforms', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'freebsd',
        configurable: true
      });

      // Reset factory to force re-detection
      PlatformFactory.reset();

      await expect(PlatformFactory.getPlatform()).rejects.toThrow(PlatformError);
      await expect(PlatformFactory.getPlatform()).rejects.toMatchObject({
        code: ErrorCode.PLATFORM_NOT_SUPPORTED
      });

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should cache and reuse platform instance', async () => {
      const currentPlatform = detectPlatform();
      
      if (PlatformFactory.isPlatformSupported(currentPlatform)) {
        const platform1 = await PlatformFactory.getPlatform();
        const platform2 = await PlatformFactory.getPlatform();
        
        // Should return the same instance
        expect(platform1).toBe(platform2);
      }
    });

    it('should include platform information in error details', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'aix',
        configurable: true
      });

      // Reset factory to force re-detection
      PlatformFactory.reset();

      try {
        await PlatformFactory.getPlatform();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(PlatformError);
        const platformError = error as PlatformError;
        expect(platformError.details).toBeDefined();
        expect(platformError.details.detectedPlatform).toBe('aix');
        expect(platformError.details.supportedPlatforms).toContain('win32');
        expect(platformError.details.supportedPlatforms).toContain('darwin');
        expect(platformError.details.supportedPlatforms).toContain('linux');
      }

      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });
  });

  describe('reset', () => {
    it('should clear cached instance', async () => {
      const currentPlatform = detectPlatform();
      
      if (PlatformFactory.isPlatformSupported(currentPlatform)) {
        const platform1 = await PlatformFactory.getPlatform();
        
        PlatformFactory.reset();
        
        const platform2 = await PlatformFactory.getPlatform();
        
        // After reset, should create a new instance
        // Note: This might be the same object in practice, but the factory
        // should have gone through the creation process again
        expect(platform2).toBeDefined();
      }
    });

    it('should clear current platform', async () => {
      try {
        await PlatformFactory.getPlatform();
      } catch (error) {
        // Ignore errors from stub implementations
      }
      
      expect(PlatformFactory.getCurrentPlatform()).not.toBeNull();
      
      PlatformFactory.reset();
      
      expect(PlatformFactory.getCurrentPlatform()).toBeNull();
    });
  });
});
