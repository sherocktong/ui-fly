import { resolve, join, dirname } from 'node:path';
import { cp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { validateEntry, Logger } from './utils.js';

const execFileAsync = promisify(execFile);
const require2 = createRequire(__filename);

export interface PackFlags {
  out?: string;
  name?: string;
  icon?: string;
  verbose?: boolean;
  quiet?: boolean;
}

function resolveElectronBuilder(): string {
  try {
    const pkgPath = require2.resolve('electron-builder/package.json');
    return resolve(dirname(pkgPath), 'cli.js');
  } catch {
    throw new Error(
      'electron-builder not found. Ensure ui-fly was installed with its dependencies (npm install -g ui-fly).'
    );
  }
}

function resolveElectronPath(): string {
  try {
    return dirname(require2.resolve('electron/package.json'));
  } catch {
    throw new Error(
      'electron not found. Ensure ui-fly was installed with its dependencies (npm install -g ui-fly).'
    );
  }
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

  // Copy electron from ui-fly's installation so electron-builder can resolve
  // the version and access the pre-downloaded binaries.
  const electronSrc = resolveElectronPath();
  const electronDest = join(tempDir, 'node_modules', 'electron');
  await mkdir(dirname(electronDest), { recursive: true });
  await cp(electronSrc, electronDest, { recursive: true, force: true });

  const electronPkg = JSON.parse(await readFile(join(electronDest, 'package.json'), 'utf-8'));
  const electronVersion = electronPkg.version as string;

  // Write minimal package.json for the pack
  const pkg = {
    name: appName,
    version: '1.0.0',
    description: `${appName} — packaged by ui-fly`,
    author: 'ui-fly',
    main: 'main.js',
    devDependencies: {
      electron: electronVersion,
    },
    build: {
      appId: `com.ui-fly.${appName}`,
      productName: appName,
      directories: {
        output: resolve(outDir),
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

  const electronBuilderPath = resolveElectronBuilder();

  logger.debug('Running:', electronBuilderPath, 'in', tempDir);

  try {
    await execFileAsync('node', [electronBuilderPath], { cwd: tempDir, encoding: 'utf-8' });
    logger.info('Packaging complete:', outDir);
  } catch (err) {
    logger.error('Packaging failed:', err);
    throw err;
  } finally {
    await rm(tempDir, { recursive: true, force: true, maxRetries: 3 });
  }
}
