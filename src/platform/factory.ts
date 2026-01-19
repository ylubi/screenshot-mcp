/**
 * Platform Factory
 * 
 * This module provides platform detection and factory pattern
 * for creating platform-specific screenshot implementations.
 */

import type { PlatformScreenshot } from './interface.js';
import { ErrorCode, PlatformError } from '../types/errors.js';

/**
 * Supported Platform Types
 */
export enum PlatformType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  UNKNOWN = 'unknown'
}

/**
 * Detect the current platform
 * 
 * Uses Node.js process.platform to determine the operating system.
 * 
 * @returns The detected platform type
 */
export function detectPlatform(): PlatformType {
  const platform = process.platform;
  
  switch (platform) {
    case 'win32':
      return PlatformType.WINDOWS;
    case 'darwin':
      return PlatformType.MACOS;
    case 'linux':
      return PlatformType.LINUX;
    default:
      return PlatformType.UNKNOWN;
  }
}

/**
 * Get a human-readable platform name
 * 
 * @param platform - Platform type
 * @returns Human-readable platform name
 */
export function getPlatformName(platform: PlatformType): string {
  switch (platform) {
    case PlatformType.WINDOWS:
      return 'Windows';
    case PlatformType.MACOS:
      return 'macOS';
    case PlatformType.LINUX:
      return 'Linux';
    case PlatformType.UNKNOWN:
      return 'Unknown';
  }
}

/**
 * Platform Factory
 * 
 * Factory class for creating platform-specific screenshot implementations.
 * Uses lazy loading to only import the platform implementation when needed.
 */
export class PlatformFactory {
  private static instance: PlatformScreenshot | null = null;
  private static currentPlatform: PlatformType | null = null;

  /**
   * Get the platform-specific screenshot implementation
   * 
   * This method uses lazy loading and caching to ensure only one
   * platform implementation is loaded and reused.
   * 
   * @returns Promise resolving to platform screenshot implementation
   * @throws {PlatformError} If platform is not supported
   */
  static async getPlatform(): Promise<PlatformScreenshot> {
    // Return cached instance if available
    if (this.instance !== null) {
      return this.instance;
    }

    // Detect platform
    const platform = detectPlatform();
    this.currentPlatform = platform;

    // Load platform-specific implementation
    try {
      switch (platform) {
        case PlatformType.WINDOWS:
          const { WindowsPlatform } = await import('./windows.js');
          this.instance = new WindowsPlatform();
          break;

        case PlatformType.MACOS:
          const { MacOSPlatform } = await import('./macos.js');
          this.instance = new MacOSPlatform();
          break;

        case PlatformType.LINUX:
          const { LinuxPlatform } = await import('./linux.js');
          this.instance = new LinuxPlatform();
          break;

        case PlatformType.UNKNOWN:
        default:
          throw new PlatformError(
            ErrorCode.PLATFORM_NOT_SUPPORTED,
            `Platform '${process.platform}' is not supported. Supported platforms: Windows, macOS, Linux.`,
            {
              detectedPlatform: process.platform,
              supportedPlatforms: ['win32', 'darwin', 'linux']
            }
          );
      }

      return this.instance;
    } catch (error) {
      // If it's already a PlatformError, rethrow it
      if (error instanceof PlatformError) {
        throw error;
      }

      // Handle import errors (e.g., platform implementation not yet created)
      throw new PlatformError(
        ErrorCode.PLATFORM_NOT_SUPPORTED,
        `Failed to load platform implementation for ${getPlatformName(platform)}: ${(error as Error).message}`,
        {
          platform: getPlatformName(platform),
          originalError: (error as Error).message
        }
      );
    }
  }

  /**
   * Get the current detected platform type
   * 
   * @returns The current platform type, or null if not yet detected
   */
  static getCurrentPlatform(): PlatformType | null {
    return this.currentPlatform;
  }

  /**
   * Reset the factory (mainly for testing purposes)
   * 
   * Clears the cached instance and platform detection.
   */
  static reset(): void {
    this.instance = null;
    this.currentPlatform = null;
  }

  /**
   * Check if a platform is supported
   * 
   * @param platform - Platform type to check
   * @returns True if platform is supported
   */
  static isPlatformSupported(platform: PlatformType): boolean {
    return platform === PlatformType.WINDOWS ||
           platform === PlatformType.MACOS ||
           platform === PlatformType.LINUX;
  }
}
