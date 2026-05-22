import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/main.ts', 'src/preload.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node22',
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['electron', 'electron-builder'],
});
