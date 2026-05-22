---
name: ui-fly
description: Design UIs with AI-generated HTML and render them in an opened Electron window, or pack them into standalone apps.
---

Use the `ui-fly` CLI to design UIs with AI-generated HTML, preview them live in an Electron window, and package them as standalone desktop apps.

Prerequisites:
- `ui-fly` must be installed (globally via `npm install -g ui-fly` or available via `npx ui-fly`)

## UI Design

### Phase 1: Prompt Analysis

Before generating any HTML, analyze the user's prompt thoroughly.

Steps:
1. Break the prompt into detailed sub-tasks for analysis. Examples of sub-tasks:
   - Identify the UI type (dashboard, landing page, form, etc.)
   - Extract layout requirements (sidebar, grid, responsive breakpoints)
   - Extract visual style requirements (color scheme, typography, spacing)
   - Identify interactive elements and state management needs
   - Identify any asset requirements (icons, images, illustrations)
   - Define accessibility and usability considerations
2. Create **at most 3 sub-agents at a time** (like a thread pool) to consume the sub-tasks concurrently.
   - Assign each sub-agent a focused sub-task.
   - Wait for all active sub-agents to return before spawning the next batch.
   - Continue until all sub-tasks are analyzed.
3. Consolidate all sub-agent findings into a unified design specification.

### Phase 2: HTML Generation

Use the same thread-pool approach to generate the HTML based on the analysis.

Steps:
1. Break HTML generation into sub-tasks based on the analysis results. Examples:
   - Generate the HTML skeleton and semantic structure
   - Generate CSS styles (layout, colors, typography, animations)
   - Generate JavaScript for interactivity and state management
   - Generate or reference required assets (SVG icons, placeholder images)
2. Create **at most 3 sub-agents at a time** to consume the generation sub-tasks concurrently.
   - Assign each sub-agent a focused generation sub-task.
   - Wait for all active sub-agents to return before spawning the next batch.
   - Continue until all generation sub-tasks are complete.
3. Merge all generated pieces into a single, self-contained HTML file.
4. Write the final HTML file(s) to disk.

### Phase 3: Launch GUI

ONLY after the HTML files exist on disk, run `ui-fly serve` to launch a GUI for the rendered HTMLs.

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
1. Ensure the HTML file exists — generate/write it first if needed
2. ONLY run `ui-fly serve <path>` after the HTML has been written to disk
3. Report the opened window details or any errors

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

## UI Packing

Use `ui-fly pack` to package created HTMLs into a runnable desktop app.

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
- Use sub-agents sparingly: spawn at most 3 concurrently, wait for completion before starting the next batch
