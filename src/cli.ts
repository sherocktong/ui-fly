#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import electron from 'electron';
import cac from 'cac';
import { serveCommand } from './serve.js';
import { screenshotCommand } from './screenshot.js';
import { packCommand } from './pack.js';

function getVersion(): string {
  try {
    const pkgPath = join(dirname(__filename), '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version as string;
  } catch {
    return '0.0.0';
  }
}

const cli = cac('ui-fly');

// Fast-path: --version and --help don't need Electron
const rawArgs = process.argv.slice(2);
if (!process.versions.electron) {
  if (rawArgs.includes('-v') || rawArgs.includes('--version') || rawArgs.includes('-V')) {
    console.log(`${cli.name}/${getVersion()} ${process.platform}-${process.arch} node-${process.version}`);
    process.exit(0);
  }
  if (rawArgs.includes('-h') || rawArgs.includes('--help') || rawArgs.length === 0) {
    cli.help();
    cli.version(getVersion());
    cli.parse();
    process.exit(0);
  }
}

// Respawn under Electron if not already running there
if (!process.versions.electron) {
  const isServe = rawArgs[0] === 'serve';

  const child = spawn(
    String(electron),
    [__filename, ...rawArgs],
    isServe
      ? { stdio: 'ignore', detached: true }
      : { stdio: 'inherit' }
  );

  if (isServe) {
    child.unref();
    process.exit(0);
  }

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
} else {
  cli
    .command('serve <entry>', 'Launch an HTML file or directory in an Electron window')
    .option('--width <width>', 'Window width', { default: 1280 })
    .option('--height <height>', 'Window height', { default: 800 })
    .option('--title <title>', 'Window title')
    .option('--fullscreen', 'Open in fullscreen mode')
    .option('--verbose', 'Enable verbose logging')
    .option('--quiet', 'Suppress all non-error output')
    .action(async (entry: string, flags) => {
      try {
        await serveCommand(entry, {
          width: parseInt(flags.width, 10),
          height: parseInt(flags.height, 10),
          title: flags.title,
          fullscreen: flags.fullscreen,
          verbose: flags.verbose,
          quiet: flags.quiet,
        });
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });

  cli
    .command('screenshot <entry>', 'Capture a screenshot of an HTML UI')
    .option('-o, --output <path>', 'Output file path')
    .option('--format <format>', 'Image format (png or jpg)', { default: 'png' })
    .option('--width <width>', 'Viewport width', { default: 1280 })
    .option('--height <height>', 'Viewport height', { default: 800 })
    .option('--wait <ms>', 'Wait milliseconds before capturing', { default: 0 })
    .option('--fullpage', 'Capture the full scrollable page')
    .option('--selector <selector>', 'Capture a specific DOM element')
    .option('--headless', 'Run in headless mode (hide window)')
    .option('--json', 'Output result as JSON')
    .option('--verbose', 'Enable verbose logging')
    .option('--quiet', 'Suppress all non-error output')
    .action(async (entry: string, flags) => {
      try {
        await screenshotCommand(entry, {
          output: flags.output,
          format: flags.format,
          width: parseInt(flags.width, 10),
          height: parseInt(flags.height, 10),
          wait: parseInt(flags.wait, 10),
          fullpage: flags.fullpage,
          selector: flags.selector,
          headless: flags.headless,
          json: flags.json,
          verbose: flags.verbose,
          quiet: flags.quiet,
        });
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });

  cli
    .command('pack <entry>', 'Package a UI directory as a standalone Electron app')
    .option('-o, --out <dir>', 'Output directory', { default: './release' })
    .option('-n, --name <name>', 'App name', { default: 'ui-fly-app' })
    .option('--icon <path>', 'Path to app icon (.icns or .ico)')
    .option('--verbose', 'Enable verbose logging')
    .option('--quiet', 'Suppress all non-error output')
    .action(async (entry: string, flags) => {
      try {
        await packCommand(entry, {
          out: flags.out,
          name: flags.name,
          icon: flags.icon,
          verbose: flags.verbose,
          quiet: flags.quiet,
        });
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });

  cli
    .option('-V', 'Display version number')
    .option('-v, --version', 'Display version number');

  cli.help();
  cli.version(getVersion());

  const parsed = cli.parse();

  if (parsed.options.V) {
    console.log(`${cli.name}/${getVersion()} ${process.platform}-${process.arch} node-${process.version}`);
    process.exit(0);
  }
}
