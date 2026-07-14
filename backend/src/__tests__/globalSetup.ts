import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Global test setup — runs ONCE for the whole suite (not per file).
 *
 * Previously every test file booted its own in-memory MongoDB in its
 * setupFiles hook; with 15+ files that's 15 mongod startups and the resource
 * contention that made the suite slow and load-flaky. Here we start a single
 * instance, hand its URI to the workers via an env var (inherited when Vitest
 * forks them), and stop it on teardown.
 */
let mongod: MongoMemoryServer | undefined;

export async function setup(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_TEST_URI = mongod.getUri();
}

export async function teardown(): Promise<void> {
  await mongod?.stop();
}
