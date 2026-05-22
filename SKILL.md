---
name: ui-fly
description: Auto-build HTML files and render them in an opened Electron UI window using the ui-fly CLI.
---

Use the `ui-fly` CLI to render HTML UIs in an Electron window, capture screenshots, or package them as standalone desktop apps.

Prerequisites:
- `ui-fly` must be installed (globally via `npm install -g ui-fly` or available via `npx ui-fly`)
- The target HTML file or directory must exist

Workflow:
1. Generate or write the HTML file(s) to disk
2. Use `ui-fly serve` to open the UI in an Electron window for live preview
3. Use `ui-fly screenshot` to capture the rendered result
4. Use `ui-fly pack` to build a standalone desktop app

Commands:

### `serve`
Launch an HTML file or directory in an Electron window.

Usage:
```bash
ui-fly serve <path> [options]
```

Options:
- `--width <number>` — Window width (default: 1280)
- `--height <number>` — Window height (default: 800)
- `--title <string>` — Window title
- `--fullscreen` — Open in fullscreen mode
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress non-error output

Steps:
1. If the HTML does not exist yet, generate/write it first
2. Verify the target path exists (file or directory)
3. Run `ui-fly serve <path>` with the requested options
4. Report the opened window details or any errors

### `screenshot`
Capture a screenshot of a rendered HTML UI.

Usage:
```bash
ui-fly screenshot <path> --output <path> [options]
```

Options:
- `-o, --output <path>` — Output file path (required)
- `--format <png|jpg>` — Image format (default: png)
- `--width <number>` — Viewport width (default: 1280)
- `--height <number>` — Viewport height (default: 800)
- `--wait <ms>` — Wait milliseconds before capturing (default: 0)
- `--fullpage` — Capture the full scrollable page
- `--selector <selector>` — Capture a specific DOM element
- `--headless` — Hide the window during capture
- `--json` — Output result as JSON
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress non-error output

Steps:
1. Verify the target HTML path exists
2. Ensure the output directory exists (create if needed)
3. Run `ui-fly screenshot <path> --output <path>` with requested options
4. If `--json` was passed, parse and return the result object
5. Otherwise, confirm the screenshot file path

### `pack`
Package a UI directory as a standalone Electron app.

Usage:
```bash
ui-fly pack <directory> [options]
```

Options:
- `-o, --out <dir>` — Output directory (default: ./release)
- `-n, --name <name>` — App name (default: ui-fly-app)
- `--icon <path>` — Path to app icon (.icns or .ico)
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress non-error output

Steps:
1. Verify the target directory exists and contains an HTML entry point
2. Ensure the output directory exists (create if needed)
3. Run `ui-fly pack <directory>` with requested options
4. Report the packaged app path or any errors

General Rules:
- Always validate that the target path exists before running any command
- If `ui-fly` is not globally available, fall back to `npx ui-fly`
- Use `--json` for screenshot when the result needs to be parsed programmatically
- Use `--headless` for screenshots when no visual review is needed
