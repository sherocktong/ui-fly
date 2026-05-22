import { resolve, join, dirname } from 'node:path';
import { cp, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { validateEntry, Logger } from './utils.js';

const execFileAsync = promisify(execFile);

export interface PackFlags {
  out?: string;
  name?: string;
  icon?: string;
  verbose?: boolean;
  quiet?: boolean;
}

export async function packCommand(entry: string, flags: PackFlags): Promise<void> {
  const logger = new Logger(flags.verbose, flags.quiet);

  const { path } = await validateEntry(entry);
  const outDir = resolve(flags.out ?? './release');
  const appName = flags.name ?? 'ui-fly-app';

  logger.info('Packaging', path, '→', outDir);

  const tempDir = resolve(outDir, '.ui-fly-pack-temp');
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  // Copy user content
  const contentDir = join(tempDir, 'content');
  await cp(path, contentDir, { recursive: true });

  // Write minimal package.json for the pack
  const pkg = {
    name: appName,
    version: '1.0.0',
    main: 'main.js',
    dependencies: {
      electron: '^35.0.0',
      'electron-builder': '^26.0.0',
    },
    build: {
      appId: `com.ui-fly.${appName}`,
      productName: appName,
      directories: {
        output: resolve(outDir),
        app: tempDir,
      },
      files: ['main.js', 'content/**/*'],
      mac: {
        target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
        category: 'public.app-category.developer-tools',
      },
      win: {
        target: [{ target: 'portable', arch: ['x64'] }],
      },
    },
  };

  await writeFile(join(tempDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // Write minimal main.js for the packaged app
  const mainJs = `const { app, BrowserWindow } = require('electron');
const { join } = require('path');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(join(__dirname, 'content', 'index.html'));
});

app.on('window-all-closed', () => app.quit());
`;

  await writeFile(join(tempDir, 'main.js'), mainJs);

  // Install dependencies so electron-builder can resolve the electron version
  logger.debug('Running:', 'npm install', 'in', tempDir);
  await execFileAsync('npm', ['install'], { cwd: tempDir, encoding: 'utf-8' });

  // Run electron-builder from the temp directory so it reads package.json
  // with the nested "build" property correctly.
  const args = ['electron-builder'];

  logger.debug('Running:', 'npx', args.join(' '), 'in', tempDir);

  try {
    await execFileAsync('npx', args, { cwd: tempDir, encoding: 'utf-8' });
    logger.info('Packaging complete:', outDir);
  } catch (err) {
    logger.error('Packaging failed:', err);
    throw err;
  } finally {
    await rm(tempDir, { recursive: true, force: true, maxRetries: 3 });
  }
}
