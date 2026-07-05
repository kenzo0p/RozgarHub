import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    // First run downloads a mongod binary for mongodb-memory-server
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
