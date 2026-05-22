import { app } from 'electron';
import { createWindow, getMainWindow, whenReady, onWindowAllClosed, quit } from './main.js';
import { validateEntry, resolveHtmlPath, Logger } from './utils.js';

export interface ServeFlags {
  width?: number;
  height?: number;
  title?: string;
  fullscreen?: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

export async function serveCommand(entry: string, flags: ServeFlags): Promise<void> {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  const logger = new Logger(flags.verbose, flags.quiet);

  const { type, path } = await validateEntry(entry);
  const url = resolveHtmlPath(path, type);

  logger.info('Launching', url);
  logger.debug('Flags:', flags);

  await whenReady();

  const win = createWindow({
    width: flags.width,
    height: flags.height,
    title: flags.title,
    fullscreen: flags.fullscreen,
    show: true,
  });

  await win.loadURL(url);

  onWindowAllClosed(() => {
    quit();
  });
}
