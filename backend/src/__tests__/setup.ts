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
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Isolate tests: wipe all collections between tests
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
