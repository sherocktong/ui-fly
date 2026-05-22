import { app, ipcMain, BrowserWindow } from 'electron';
import { join } from 'node:path';

export interface WindowOptions {
  width?: number;
  height?: number;
  title?: string;
  fullscreen?: boolean;
  show?: boolean;
  preload?: boolean;
}

let mainWindow: BrowserWindow | null = null;

export function createWindow(options: WindowOptions = {}): BrowserWindow {
  const {
    width = 1280,
    height = 800,
    title = 'ui-fly',
    fullscreen = false,
    show = true,
    preload = true,
  } = options;

  const win = new BrowserWindow({
    width,
    height,
    title,
    fullscreen,
    show,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preload ? join(__dirname, 'preload.js') : undefined,
    },
  });

  mainWindow = win;

  win.on('closed', () => {
    mainWindow = null;
  });

  return win;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setupIpcHandlers(): void {
  ipcMain.on('get-env', (event, key: string) => {
    event.returnValue = process.env[key];
  });
}

export async function whenReady(): Promise<void> {
  await app.whenReady();
  setupIpcHandlers();
}

export function quit(): void {
  app.quit();
}

export function onWindowAllClosed(callback: () => void): void {
  app.on('window-all-closed', callback);
}
