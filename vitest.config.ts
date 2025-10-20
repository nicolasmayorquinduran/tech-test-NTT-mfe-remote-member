import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.vitest.ts'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
