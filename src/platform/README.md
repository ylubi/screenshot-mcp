# Platform Abstraction Layer

This module provides a unified interface for cross-platform screenshot operations.

## Architecture

The platform abstraction layer consists of:

1. **Interface** (`interface.ts`): Defines the `PlatformScreenshot` interface that all platform implementations must follow
2. **Factory** (`factory.ts`): Provides platform detection and lazy loading of platform-specific implementations
3. **Platform Implementations**: Windows, macOS, and Linux specific implementations

## Usage

### Getting Platform Instance

```typescript
import { PlatformFactory } from './platform/index.js';

// Get the platform-specific implementation
const platform = await PlatformFactory.getPlatform();

// Use the platform methods
const windows = await platform.listWindows(false);
const image = await platform.captureWindow(windows[0].handle, true);
```

### Platform Detection

```typescript
import { detectPlatform, PlatformType, getPlatformName } from './platform/index.js';

// Detect current platform
const currentPlatform = detectPlatform();
console.log(`Running on: ${getPlatformName(currentPlatform)}`);

// Check if platform is supported
if (PlatformFactory.isPlatformSupported(currentPlatform)) {
  console.log('Platform is supported!');
}
```

## Platform Implementations

### Windows (`windows.ts`)
- Uses node-screenshots library (wraps Windows API: GDI+ or Windows.Graphics.Capture)
- Status: ✅ Completed (task 6.1)
- Features:
  - Window screenshot by window ID
  - Screen region capture with bounds validation
  - Window enumeration with filtering
  - Multi-monitor support

### macOS (`macos.ts`)
- Uses node-screenshots library (wraps Core Graphics: CGWindowListCreateImage)
- Status: ✅ Completed (task 7.1)
- Features:
  - Window screenshot by window ID
  - Screen region capture with bounds validation
  - Window enumeration with filtering
  - Multi-monitor support

### Linux (`linux.ts`)
- Uses node-screenshots library (wraps X11 or Wayland protocol)
- Status: ⚠️ Stub implementation (to be completed in task 8.1)

## Error Handling

The factory throws `PlatformError` with code `PLATFORM_NOT_SUPPORTED` when:
- Running on an unsupported platform
- Platform implementation fails to load

```typescript
try {
  const platform = await PlatformFactory.getPlatform();
} catch (error) {
  if (error instanceof PlatformError) {
    console.error(`Platform error: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    console.error(`Details:`, error.details);
  }
}
```

## Testing

The factory includes comprehensive unit tests covering:
- Platform detection for all supported platforms
- Factory caching and singleton behavior
- Error handling for unsupported platforms
- Reset functionality for testing

Run tests:
```bash
npm test -- src/platform/factory.test.ts
```

## Design Patterns

### Factory Pattern
The `PlatformFactory` uses the factory pattern to create platform-specific implementations without exposing the creation logic to clients.

### Singleton Pattern
The factory caches the platform instance to ensure only one implementation is loaded and reused throughout the application lifecycle.

### Lazy Loading
Platform implementations are loaded dynamically using dynamic imports, reducing initial bundle size and only loading the necessary platform code.
