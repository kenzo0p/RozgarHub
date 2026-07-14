import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // One shared in-memory MongoDB for the whole run (see globalSetup.ts),
    // then per-file connection + collection wiping (setup.ts).
    globalSetup: ['./src/__tests__/globalSetup.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    // First run downloads a mongod binary for mongodb-memory-server
    hookTimeout: 120_000,
    testTimeout: 30_000,
    // Files run in parallel again — safe now that there's a single shared
    // in-memory MongoDB (globalSetup) and each file uses its own database
    // (setup.ts), so no per-file mongod contention and no cross-file wipes.
  },
});
