/**
 * Test environment setup — runs before each test file's imports.
 *
 * Env vars MUST be set before anything imports config/env.ts (which
 * validates process.env at module load and exits on failure). dotenv
 * does not overwrite existing vars, so values set here win over .env.
 */
process.env.NODE_ENV = 'test';
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-at-least-16-chars';
process.env.MONGODB_URL = 'mongodb://placeholder-not-used-in-tests:27017/test';
process.env.CLOUD_NAME = 'test-cloud';
process.env.CLOUD_API_KEY = 'test-key';
process.env.CLOUD_API_SECRET = 'test-secret';
process.env.REDIS_URL = ''; // Falsy → redis client never created, cache disabled

import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';

beforeAll(async () => {
  // Connect to the single shared in-memory MongoDB started in globalSetup.
  const uri = process.env.MONGO_TEST_URI;
  if (!uri) {
    throw new Error('MONGO_TEST_URI not set — is globalSetup.ts registered in vitest.config?');
  }
  // Each test file gets its OWN database on the shared server, so files can run
  // in parallel without their collection-wipes clobbering each other.
  const dbName = `test_${Math.random().toString(36).slice(2)}`;
  await mongoose.connect(uri, { dbName });

  // Build every model's indexes up front. autoIndex is async/background, so
  // without this a unique-constraint test can race ahead of its index and see
  // no duplicate-key error (flaky 409 assertions).
  await Promise.all(Object.values(mongoose.models).map((model) => model.createIndexes()));
});

afterEach(async () => {
  // Isolate tests within a file: wipe this file's collections between tests.
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  // Only this file's mongoose connection — the shared server is stopped by
  // globalSetup's teardown.
  await mongoose.disconnect();
});
