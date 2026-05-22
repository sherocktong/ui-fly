# cc-design

Lightweight Electron CLI for launching, screenshotting, and packaging HTML UIs.

A minimalist alternative to heavy design tools — just give it an HTML file and it renders it in a native Electron window. No servers, no databases, no complex architecture.

## Install

```bash
npm install -g cc-design
```

Or use directly with `npx`:

```bash
npx cc-design serve ./my-ui/index.html
```

## Commands

### `serve`

Launch an HTML file or directory in an Electron window.

```bash
cc-design serve ./my-ui/index.html
cc-design serve ./my-ui/ --width 1200 --height 800 --title "My App"
cc-design serve ./my-ui/ --fullscreen
```

Options:
- `--width <number>` — Window width (default: 1280)
- `--height <number>` — Window height (default: 800)
- `--title <string>` — Window title
- `--fullscreen` — Open in fullscreen mode
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress non-error output

### `screenshot`

Capture a screenshot of a rendered HTML UI.

```bash
cc-design screenshot ./my-ui/index.html --output ./out.png
cc-design screenshot ./my-ui/index.html --output ./out.jpg --format jpg --fullpage
cc-design screenshot ./my-ui/index.html --output ./out.png --width 1920 --height 1080 --wait 2000
cc-design screenshot ./my-ui/index.html --output ./out.png --headless --selector "#app"
```

Options:
- `-o, --output <path>` — Output file path
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

### `pack`

Package a UI directory as a standalone Electron app (macOS `.app` / Windows `.exe`).

```bash
cc-design pack ./my-ui/ --out ./release --name "MyApp"
```

Options:
- `-o, --out <dir>` — Output directory (default: ./release)
- `-n, --name <name>` — App name (default: cc-design-app)
- `--icon <path>` — Path to app icon (.icns or .ico)
- `--verbose` — Enable verbose logging
- `--quiet` — Suppress non-error output

## Usage from a Claude Code Skill

`cc-design` is designed to be called from skills via shell commands:

```typescript
// In a skill
await bash`cc-design serve ./generated-ui/index.html --width 1440 --height 900`;

// Screenshot for review
const result = await bash`cc-design screenshot ./generated-ui/index.html --output ./preview.png --headless --json`;
const { path } = JSON.parse(result.stdout);
```

## Development

```bash
npm install
npm run build
npm run dev      # Watch mode
```

## License

MIT
