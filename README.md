# Vesktop

[![Test](https://github.com/morawskidotmy/Vesktop/actions/workflows/test.yml/badge.svg)](https://github.com/morawskidotmy/Vesktop/actions/workflows/test.yml)
[![Boot Time](https://img.shields.io/badge/Boot%20Time-~1.3s-brightgreen)](https://github.com/morawskidotmy/Vesktop)
[![Memory](https://img.shields.io/badge/Memory-~9MB%20Heap-blue)](https://github.com/morawskidotmy/Vesktop)

Vesktop is a custom Discord desktop app - optimized for speed and performance.

**Main features**:
- Vencord preinstalled
- Much more lightweight and faster than the official Discord app
- Linux Screenshare with sound & wayland
- Much better privacy, since Discord has no access to your system
- **Aria2 integration** for fast multi-threaded downloads (16 connections)
- **Transfer.ng support** for large file uploads (>25MB)
- **Performance profiler** built-in for boot time analysis
- **Dark theme only** - optimized for performance

## Performance

Built-in profiler reports on every boot:

```
=== PERFORMANCE REPORT ===
Boot Time: ~1300ms

Component Timings:
  createWindows: ~200ms
  app-init: ~170ms
  mainWindow: ~100ms
  app-ready: ~95ms
  vencord-main: ~40ms
  vencord-files: ~12ms

Memory Usage:
  Heap Used: ~9MB
  RSS: ~177MB
========================
```

**Not yet supported**:
- Global Keybinds
- see the [Roadmap](https://github.com/Vencord/Vesktop/issues/324)

![](https://github.com/Vencord/Vesktop/assets/45497981/8608a899-96a9-4027-9725-2cb02ba189fd)
![](https://github.com/Vencord/Vesktop/assets/45497981/8701e5de-52c4-4346-a990-719cb971642e)

## Installing

Visit https://vesktop.dev/install

## Building from Source

You need to have the following dependencies installed:
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)
- pnpm: `npm install --global pnpm`
- (Optional) [aria2](https://aria2.github.io/) for fast downloads

Packaging will create builds in the dist/ folder

```sh
git clone https://github.com/morawskidotmy/Vesktop
cd Vesktop

# Install Dependencies
pnpm i

# Either run it without packaging
pnpm start

# Or package (will build packages for your OS)
pnpm package

# Or only build the Linux Pacman package
pnpm package --linux pacman

# Or package to a directory only
pnpm package:dir
```

## Testing

Run the test suite:

```sh
# Run all tests (lint + types + unit)
pnpm test

# Run only unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Run type checking
pnpm testTypes
```

## Settings

### Downloads & Uploads
- **Enable Aria2 Downloads**: Use aria2c for 16-connection parallel downloads. Files save to ~/Downloads.
- **Enable Transfer.ng Upload**: Auto-upload files >25MB to transfer.ng and share the link.
- **Transfer Server URL**: Custom transfer.ng server (default: `https://transfer.morawski.my/`)

### OpenAsar Optimizations
- Performance Mode (GPU rasterization, zero-copy, hardware overlays)
- Disable Tracking (blocks Discord analytics)
- DOM Optimizer (smoother animations)

## Building LibVesktop from Source

This is a small C++ helper library Vesktop uses on Linux to emit D-Bus events. By default, prebuilt binaries for x64 and arm64 are used.

If you want to build it from source:
1. Install build dependencies:
    - Debian/Ubuntu: `apt install build-essential python3 curl pkg-config libglib2.0-dev`
    - Fedora: `dnf install @c-development @development-tools python3 curl pkgconf-pkg-config glib2-devel`
2. Run `pnpm buildLibVesktop`
3. From now on, building Vesktop will use your own build
