import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    // First run downloads a mongod binary for mongodb-memory-server
    hookTimeout: 120_000,
    testTimeout: 30_000,
    // Each test file boots its own in-memory MongoDB in beforeAll. Running
    // every file at once (the suite has grown past a dozen) spins up that many
    // mongod processes and starves CPU/memory, causing spurious 30s timeouts
    // and beforeAll failures. Run files sequentially for a deterministic suite
    // (~1 min); individual files still parallelize their tests.
    fileParallelism: false,
  },
});
