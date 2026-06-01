import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    target: 'es2022',
    platform: 'neutral',
  },
  {
    entry: { 'shared/index': 'src/shared/index.ts' },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    target: 'es2022',
    platform: 'neutral',
  },
]);
