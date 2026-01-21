/**
 * Long Screenshot Utilities
 * 
 * Utilities for capturing long screenshots by scrolling and stitching.
 */

import { ImageBuffer } from '../types/index.js';
import { PlatformScreenshot } from '../platform/interface.js';
import { ScreenshotError, ErrorCode } from '../types/errors.js';

/**
 * Long Screenshot Options
 */
export interface LongScreenshotOptions {
  scrollDelay?: number;      // Delay between scrolls in ms (default: 500)
  scrollAmount?: number;      // Pixels to scroll each time (default: auto-detect)
  maxScrolls?: number;        // Maximum number of scrolls (default: 20)
  overlapPixels?: number;     // Overlap between screenshots (default: 50)
}

/**
 * Capture a long screenshot by scrolling and stitching
 */
export async function captureLongScreenshot(
  platform: PlatformScreenshot,
  windowHandle: string,
  includeFrame: boolean,
  options: LongScreenshotOptions = {}
): Promise<ImageBuffer> {
  const scrollDelay = options.scrollDelay ?? 500;
  const maxScrolls = options.maxScrolls ?? 20;
  const overlapPixels = options.overlapPixels ?? 50;

  console.error('[Long Screenshot] Starting long screenshot capture');
  console.error(`[Long Screenshot] Options: scrollDelay=${scrollDelay}, maxScrolls=${maxScrolls}, overlapPixels=${overlapPixels}`);

  // Capture first screenshot to get window dimensions
  const firstCapture = await platform.captureWindow(windowHandle, includeFrame);
  const windowHeight = firstCapture.height;
  
  console.error(`[Long Screenshot] Window dimensions: ${firstCapture.width}x${windowHeight}`);
  console.error(`[Long Screenshot] Will scroll ${maxScrolls} times using Page Down key`);

  // Collect all screenshots
  const screenshots: ImageBuffer[] = [firstCapture];
  let previousHash = hashImage(firstCapture);
  let unchangedCount = 0;

  console.error('[Long Screenshot] Starting scroll loop...');

  // Scroll and capture
  for (let i = 0; i < maxScrolls; i++) {
    console.error(`[Long Screenshot] Scroll ${i + 1}/${maxScrolls}`);
    
    // Scroll the window (scrollAmount is ignored, always 1 Page Down)
    await scrollWindow(windowHandle, 0);
    
    // Wait for content to load
    await sleep(scrollDelay);
    
    // Capture screenshot
    const capture = await platform.captureWindow(windowHandle, includeFrame);
    
    // Check if we've reached the bottom
    const currentHash = hashImage(capture);
    
    if (currentHash === previousHash) {
      unchangedCount++;
      console.error(`[Long Screenshot] Image unchanged (${unchangedCount} times)`);
      
      if (unchangedCount >= 2) {
        console.error('[Long Screenshot] Reached bottom (no changes detected)');
        break;
      }
    } else {
      unchangedCount = 0;
      screenshots.push(capture);
      console.error(`[Long Screenshot] Captured screenshot ${screenshots.length}`);
    }
    
    previousHash = currentHash;
  }

  console.error(`[Long Screenshot] Captured ${screenshots.length} screenshots total`);

  // Stitch screenshots together
  console.error('[Long Screenshot] Stitching images...');
  const result = stitchImages(screenshots, overlapPixels);
  console.error(`[Long Screenshot] Final image: ${result.width}x${result.height}`);
  
  return result;
}

/**
 * Scroll a window by the specified amount
 */
async function scrollWindow(windowHandle: string, amount: number): Promise<void> {
  const platform = process.platform;
  
  if (platform === 'win32') {
    await scrollWindowWindows(windowHandle, amount);
  } else if (platform === 'darwin') {
    await scrollWindowMacOS(amount);
  } else {
    throw new ScreenshotError(
      ErrorCode.CAPTURE_FAILED,
      'Long screenshot is not supported on this platform yet',
      { platform }
    );
  }
}

/**
 * Scroll window on Windows using keyboard Page Down key
 */
async function scrollWindowWindows(windowHandle: string, _amount: number): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const scrollScript = `
    Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      
      public class WinAPI {
        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        [DllImport("user32.dll")]
        public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
        
        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
        
        [DllImport("kernel32.dll")]
        public static extern uint GetCurrentThreadId();
        
        [DllImport("user32.dll")]
        public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
        
        public const int SW_RESTORE = 9;
        public const byte VK_NEXT = 0x22;
        public const uint KEYEVENTF_KEYUP = 0x0002;
      }
"@
    
    \\$handle = [IntPtr]${windowHandle}
    
    [WinAPI]::ShowWindow(\\$handle, [WinAPI]::SW_RESTORE) | Out-Null
    Start-Sleep -Milliseconds 100
    
    \\$currentThreadId = [WinAPI]::GetCurrentThreadId()
    \\$windowProcessId = 0
    \\$windowThreadId = [WinAPI]::GetWindowThreadProcessId(\\$handle, [ref]\\$windowProcessId)
    
    if (\\$windowThreadId -ne \\$currentThreadId) {
      [WinAPI]::AttachThreadInput(\\$currentThreadId, \\$windowThreadId, \\$true) | Out-Null
    }
    
    [WinAPI]::SetForegroundWindow(\\$handle) | Out-Null
    Start-Sleep -Milliseconds 500
    
    # Press Page Down once
    [WinAPI]::keybd_event([WinAPI]::VK_NEXT, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 50
    [WinAPI]::keybd_event([WinAPI]::VK_NEXT, 0, [WinAPI]::KEYEVENTF_KEYUP, [UIntPtr]::Zero)
    
    if (\\$windowThreadId -ne \\$currentThreadId) {
      [WinAPI]::AttachThreadInput(\\$currentThreadId, \\$windowThreadId, \\$false) | Out-Null
    }
  `;

  try {
    console.error('[Long Screenshot] Pressing Page Down key...');
    await execAsync(`powershell -Command "${scrollScript.replace(/"/g, '\\"')}"`);
    console.error('[Long Screenshot] Page Down completed');
  } catch (error) {
    console.error('[Long Screenshot] Page Down error:', error);
  }
}

/**
 * Scroll window on macOS using AppleScript
 */
async function scrollWindowMacOS(amount: number): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const scrolls = Math.ceil(amount / 100);

  const script = `
    tell application "System Events"
      repeat ${scrolls} times
        key code 125
        delay 0.05
      end repeat
    end tell
  `;

  try {
    console.error('[Long Screenshot] Attempting macOS scroll simulation...');
    await execAsync(`osascript -e '${script}'`);
    console.error('[Long Screenshot] macOS scroll simulation completed');
  } catch (error) {
    console.error('[Long Screenshot] macOS scroll error:', error);
  }
}

/**
 * Stitch multiple images together vertically with smart overlap detection
 */
function stitchImages(images: ImageBuffer[], overlapPixels: number): ImageBuffer {
  if (images.length === 0) {
    throw new ScreenshotError(
      ErrorCode.CAPTURE_FAILED,
      'No images to stitch',
      {}
    );
  }

  if (images.length === 1) {
    return images[0];
  }

  const width = images[0].width;
  
  // Find optimal overlap for each pair of images
  const overlaps: number[] = [];
  for (let i = 0; i < images.length - 1; i++) {
    const overlap = findBestOverlap(images[i], images[i + 1], overlapPixels);
    overlaps.push(overlap);
    console.error(`[Long Screenshot] Overlap between image ${i+1} and ${i+2}: ${overlap}px`);
  }
  
  // Calculate total height
  let totalHeight = images[0].height;
  for (let i = 0; i < overlaps.length; i++) {
    totalHeight += images[i + 1].height - overlaps[i];
  }

  console.error(`[Long Screenshot] Total stitched height: ${totalHeight}px`);

  // Create output buffer
  const outputData = Buffer.alloc(width * totalHeight * 4);
  
  // Copy first image
  images[0].data.copy(outputData, 0);
  
  // Copy remaining images with calculated overlaps
  let currentY = images[0].height;
  for (let i = 0; i < overlaps.length; i++) {
    const img = images[i + 1];
    const overlap = overlaps[i];
    currentY -= overlap;
    
    const sourceStart = overlap * width * 4;
    const destStart = currentY * width * 4;
    const copyLength = (img.height - overlap) * width * 4;
    
    img.data.copy(outputData, destStart, sourceStart, sourceStart + copyLength);
    currentY += img.height - overlap;
  }

  return {
    data: outputData,
    width,
    height: totalHeight,
    format: 'RGBA'
  };
}

/**
 * Find the best overlap between two images by comparing pixel similarity
 */
function findBestOverlap(img1: ImageBuffer, img2: ImageBuffer, maxOverlap: number): number {
  const width = img1.width;
  const minOverlap = Math.max(20, maxOverlap / 3);
  const maxSearchOverlap = Math.min(maxOverlap * 3, Math.min(img1.height, img2.height) / 2);
  
  let bestOverlap = maxOverlap;
  let bestScore = Infinity;
  
  // Search for the best overlap position with finer granularity
  const step = 5;
  for (let overlap = minOverlap; overlap <= maxSearchOverlap; overlap += step) {
    if (overlap > img1.height || overlap > img2.height) continue;
    
    let score = 0;
    let samples = 0;
    
    // Compare the overlapping region - focus on middle rows for better accuracy
    const startY = Math.floor(overlap * 0.2);  // Skip top 20%
    const endY = Math.floor(overlap * 0.8);    // Skip bottom 20%
    
    for (let y = startY; y < endY; y++) {
      const y1 = img1.height - overlap + y;
      const y2 = y;
      
      // Sample every 5 pixels horizontally for better accuracy
      for (let x = 0; x < width; x += 5) {
        const idx1 = (y1 * width + x) * 4;
        const idx2 = (y2 * width + x) * 4;
        
        // Calculate color difference (RGB only, ignore alpha)
        const dr = img1.data[idx1] - img2.data[idx2];
        const dg = img1.data[idx1 + 1] - img2.data[idx2 + 1];
        const db = img1.data[idx1 + 2] - img2.data[idx2 + 2];
        
        score += Math.sqrt(dr * dr + dg * dg + db * db);
        samples++;
      }
    }
    
    // Average score
    if (samples > 0) {
      score = score / samples;
      
      if (score < bestScore) {
        bestScore = score;
        bestOverlap = overlap;
      }
    }
  }
  
  console.error(`[Long Screenshot] Best overlap score: ${bestScore.toFixed(2)}`);
  
  return bestOverlap;
}

/**
 * Create a simple hash of an image for comparison
 */
function hashImage(image: ImageBuffer): string {
  const samples = 100;
  const step = Math.floor(image.data.length / samples);
  let hash = '';
  
  for (let i = 0; i < image.data.length; i += step) {
    hash += image.data[i].toString(16).padStart(2, '0');
  }
  
  return hash;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
