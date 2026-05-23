---
name: ui-fly
description: Design UIs with AI-generated HTML and render them in an opened Electron window.
---

Use the `ui-fly` CLI to design UIs with AI-generated HTML and preview them live in an Electron window.

Prerequisites:
- `ui-fly` must be installed (globally via `npm install -g ui-fly` or available via `npx ui-fly`)

## UI Design

### Phase 1: Prompt Analysis

Before generating any HTML, analyze the user's prompt thoroughly using sub-agents.

Steps:
1. Break the prompt into detailed sub-tasks for analysis. Examples of sub-tasks:
   - Identify the UI type (dashboard, landing page, form, etc.)
   - Extract layout requirements (sidebar, grid, responsive breakpoints)
   - Extract visual style requirements (color scheme, typography, spacing)
   - Identify interactive elements and state management needs
   - Identify any asset requirements (icons, images, illustrations)
   - Define accessibility and usability considerations
2. Use `TaskCreate` to register each sub-task on a shared task list, marking them `pending`.
3. Spawn **at most 3 sub-agents at a time** using the `Agent` tool to consume the sub-tasks concurrently.
   - Before launching, update each spawned sub-task to `in_progress` via `TaskUpdate`.
   - Launch each sub-agent with a focused analysis task in a single batch (parallel tool calls).
   - Wait for all active sub-agents to return their results.
   - As each sub-agent returns, mark its task `completed` via `TaskUpdate`.
   - Spawn the next batch of up to 3 sub-agents for any remaining sub-tasks.
   - Continue until all sub-tasks are analyzed.
4. Consolidate all sub-agent findings into a unified design specification.

### Phase 2: HTML Generation

Use the same sub-agent approach to generate the HTML based on the analysis.

Steps:
1. Break HTML generation into sub-tasks based on the analysis results. Examples:
   - Generate the HTML skeleton and semantic structure
   - Generate CSS styles (layout, colors, typography, animations)
   - Generate JavaScript for interactivity and state management
   - Generate or reference required assets (SVG icons, placeholder images)
2. Use `TaskCreate` to register each generation sub-task on a shared task list, marking them `pending`.
3. Spawn **at most 3 sub-agents at a time** using the `Agent` tool to consume the generation sub-tasks concurrently.
   - Before launching, update each spawned sub-task to `in_progress` via `TaskUpdate`.
   - Launch each sub-agent with a focused generation task in a single batch (parallel tool calls).
   - Wait for all active sub-agents to return their results.
   - As each sub-agent returns, mark its task `completed` via `TaskUpdate`.
   - Spawn the next batch of up to 3 sub-agents for any remaining sub-tasks.
   - Continue until all generation sub-tasks are complete.
4. Merge all generated pieces into a single, self-contained HTML file.
5. **One HTML file per designed page** — each distinct page design must be written as its own standalone HTML file. Do not split a single page across multiple files, and do not combine multiple pages into one file.
6. The primary HTML entry point **must** be named `index.html`.
7. Write the final HTML file(s) to disk.

**Plan Mode Requirement:**
- **Always enter plan mode** before generating HTML, regardless of whether legacy files exist.
- In plan mode, present the generation approach (file structure, naming, style direction) for user approval before proceeding.
- If `index.html` already exists at the target path, additionally ask the user:
  - **Overwrite** — ignore the existing file and generate a new one.
  - **Analyze first** — read the existing file, incorporate its structure/style into the generation plan, then produce the new HTML.
- Do not proceed with generation until the user has approved the plan and chosen an option.

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
3. Default the output directory to `.claude/cache/screenshots` when no explicit `--output` path is provided.
4. Run `ui-fly screenshot <path> --output <path>` with requested options.
5. If `--json` was passed, parse and return the result object.
6. Otherwise, confirm the screenshot file path.

General Rules:
- Always validate that the target path exists before running any command
- If `ui-fly` is not globally available, fall back to `npx ui-fly`
- Use `--json` for screenshot when the result needs to be parsed programmatically
- Use `--headless` for screenshots when no visual review is needed
- Use the `Agent` tool to spawn sub-agents for concurrent work
- Spawn at most 3 sub-agents concurrently; wait for completion before starting the next batch
