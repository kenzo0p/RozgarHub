import { describe, it, expect } from 'vitest';
import { api, createAuthedUser } from './helpers.js';

/** Create a worker and set their blue-collar profile fields. */
async function makeWorker(fields: Record<string, unknown>) {
  const worker = await createAuthedUser('employee');
  await api()
    .put('/api/v1/user/profile/update')
    .set('Cookie', worker.cookies)
    .send(fields);
  return worker;
}

describe('Worker discovery', () => {
  it('is employer-only', async () => {
    const worker = await createAuthedUser('employee');
    const denied = await api().get('/api/v1/user/workers').set('Cookie', worker.cookies);
    expect(denied.status).toBe(403);

    const anon = await api().get('/api/v1/user/workers');
    expect(anon.status).toBe(401);
  });

  it('filters by trade and returns matching workers', async () => {
    await makeWorker({ primaryTrade: 'Electrician', available: 'true' });
    await makeWorker({ primaryTrade: 'Plumber', available: 'true' });
    const employer = await createAuthedUser('employer');

    const res = await api()
      .get('/api/v1/user/workers?trade=electric')
      .set('Cookie', employer.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(
      res.body.data.every((w: { profile: { primaryTrade: string } }) =>
        /electric/i.test(w.profile.primaryTrade),
      ),
    ).toBe(true);
  });

  it('reveals contact for available workers and hides it for unavailable ones', async () => {
    await makeWorker({ primaryTrade: 'Welder', available: 'true' });
    await makeWorker({ primaryTrade: 'Welder', available: 'false' });
    const employer = await createAuthedUser('employer');

    const res = await api()
      .get('/api/v1/user/workers?trade=Welder')
      .set('Cookie', employer.cookies);

    const byAvailability = Object.fromEntries(
      res.body.data.map((w: { profile: { available: boolean }; phone: string | null }) => [
        String(w.profile.available),
        w.phone,
      ]),
    );
    expect(byAvailability['true']).toBeTruthy();
    expect(byAvailability['false']).toBeNull();
  });

  it('never leaks worker email', async () => {
    const worker = await makeWorker({ primaryTrade: 'Painter', available: 'true' });
    const employer = await createAuthedUser('employer');

    const res = await api()
      .get('/api/v1/user/workers?trade=Painter')
      .set('Cookie', employer.cookies);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain(worker.creds.email);
  });

  it('availableOnly hides unavailable workers', async () => {
    await makeWorker({ primaryTrade: 'Roofer', available: 'false' });
    const employer = await createAuthedUser('employer');

    const res = await api()
      .get('/api/v1/user/workers?trade=Roofer&availableOnly=true')
      .set('Cookie', employer.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
