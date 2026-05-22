import { resolve, extname, dirname } from 'node:path';
import { access, stat } from 'node:fs/promises';

export function resolveEntryPath(input: string): string {
  const absolute = resolve(input);
  return absolute;
}

export async function validateEntry(input: string): Promise<{ type: 'file' | 'directory'; path: string }> {
  const absolute = resolveEntryPath(input);
  try {
    await access(absolute);
  } catch {
    throw new Error(`Entry path does not exist: ${absolute}`);
  }

  const s = await stat(absolute);
  if (s.isDirectory()) {
    return { type: 'directory', path: absolute };
  }

  if (s.isFile()) {
    if (extname(absolute).toLowerCase() !== '.html') {
      throw new Error(`Entry file must be an HTML file: ${absolute}`);
    }
    return { type: 'file', path: absolute };
  }

  throw new Error(`Entry path is neither a file nor a directory: ${absolute}`);
}

export function resolveHtmlPath(entryPath: string, type: 'file' | 'directory'): string {
  if (type === 'file') {
    return `file://${entryPath}`;
  }
  return `file://${resolve(entryPath, 'index.html')}`;
}

export function getOutputPath(input: string, output?: string, format: 'png' | 'jpg' = 'png'): string {
  if (output) return resolve(output);
  const dir = dirname(input);
  const name = 'screenshot';
  return resolve(dir, `${name}.${format}`);
}

export class Logger {
  constructor(private verbose: boolean = false, private quiet: boolean = false) {}

  info(...args: unknown[]) {
    if (!this.quiet) console.log('[ui-fly]', ...args);
  }

  error(...args: unknown[]) {
    if (!this.quiet) console.error('[ui-fly]', ...args);
  }

  debug(...args: unknown[]) {
    if (this.verbose && !this.quiet) console.log('[ui-fly:debug]', ...args);
  }
}

export function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}
