import { app, BrowserWindow } from 'electron';
import { writeFile } from 'node:fs/promises';
import { createWindow, whenReady, quit } from './main.js';
import { validateEntry, resolveHtmlPath, getOutputPath, Logger, printJson } from './utils.js';

export interface ScreenshotFlags {
  output?: string;
  format?: 'png' | 'jpg';
  width?: number;
  height?: number;
  wait?: number;
  fullpage?: boolean;
  selector?: string;
  headless?: boolean;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

export async function screenshotCommand(entry: string, flags: ScreenshotFlags): Promise<void> {
  const logger = new Logger(flags.verbose, flags.quiet);

  const { type, path } = await validateEntry(entry);
  const url = resolveHtmlPath(path, type);
  const format = flags.format ?? 'png';
  const outputPath = getOutputPath(path, flags.output, format);

  logger.info('Screenshot', url, '→', outputPath);
  logger.debug('Flags:', flags);

  await whenReady();

  const win = createWindow({
    width: flags.width ?? 1280,
    height: flags.height ?? 800,
    show: !flags.headless,
    preload: false,
  });

  await win.loadURL(url);
  await win.webContents.executeJavaScript('document.readyState').then((state: string) => {
    if (state === 'complete') return;
    return new Promise<void>((resolve) => {
      win.webContents.once('dom-ready', () => resolve());
    });
  });

  // Wait for animations / lazy content
  const waitMs = flags.wait ?? 0;
  if (waitMs > 0) {
    logger.debug(`Waiting ${waitMs}ms before capture...`);
    await sleep(waitMs);
  }

  let image = await capture(win, flags);

  await writeFile(outputPath, format === 'png' ? image.toPNG() : image.toJPEG(90));

  logger.info('Screenshot saved to', outputPath);

  if (flags.json) {
    printJson({
      success: true,
      path: outputPath,
      format,
      width: image.getSize().width,
      height: image.getSize().height,
    });
  }

  win.close();
  quit();
}

async function capture(win: BrowserWindow, flags: ScreenshotFlags) {
  if (flags.fullpage) {
    return captureFullPage(win);
  }

  if (flags.selector) {
    return captureElement(win, flags.selector);
  }

  return win.webContents.capturePage();
}

async function captureFullPage(win: BrowserWindow) {
  const { width, height } = win.getBounds();

  const scrollHeight = await win.webContents.executeJavaScript(`
    Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    )
  `);

  win.setSize(width, scrollHeight);
  await sleep(300);

  const image = await win.webContents.capturePage();
  win.setSize(width, height);

  return image;
}

async function captureElement(win: BrowserWindow, selector: string) {
  const rect = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('Element not found: ${selector}');
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    })()
  `);

  const image = await win.webContents.capturePage(rect);
  return image;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
