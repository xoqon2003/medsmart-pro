import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest config — pure-function unit tests (no DOM).
 *
 * Scope is intentionally narrow: only `.spec.ts` / `.test.ts` files under
 * `src/app/**` that don't need browser APIs. Component-level tests will
 * live in a separate config once we add `@testing-library/react` + jsdom.
 */
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
  },
  test: {
    environment: 'node',
    include: ['src/app/**/*.{test,spec}.ts'],
    // Exclude any component tests (*.tsx) — they'll migrate to a jsdom config later.
    exclude: ['**/*.tsx', 'node_modules/**', 'server/**', 'dist/**'],
    globals: false, // prefer explicit imports
  },
});
