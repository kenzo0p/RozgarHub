import { describe, it, expect } from 'vitest';
import { api, createAuthedUser } from './helpers.js';

describe('Worker identity verification', () => {
  it('verifies a worker from a valid Aadhaar and stores only the last 4 digits', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', cookies)
      .send({ idNumber: '234567890123' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.verificationStatus).toBe('verified');
    expect(res.body.data.user.idLast4).toBe('0123');
    // The full Aadhaar must never come back
    expect(JSON.stringify(res.body)).not.toContain('234567890123');
  });

  it('accepts spaces in the Aadhaar and still stores the last 4', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', cookies)
      .send({ idNumber: '2345 6789 0123' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.idLast4).toBe('0123');
  });

  it('rejects an invalid Aadhaar (wrong length / leading digit)', async () => {
    const { cookies } = await createAuthedUser('employee');

    const bad = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', cookies)
      .send({ idNumber: '123456789012' }); // starts with 1 — invalid
    expect(bad.status).toBe(400);

    const short = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', cookies)
      .send({ idNumber: '2345' });
    expect(short.status).toBe(400);
  });

  it('is worker-only (employers verify via their company GST)', async () => {
    const { cookies } = await createAuthedUser('employer');

    const res = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', cookies)
      .send({ idNumber: '234567890123' });

    expect(res.status).toBe(403);
  });

  it('requires authentication', async () => {
    const res = await api().post('/api/v1/user/verify').send({ idNumber: '234567890123' });
    expect(res.status).toBe(401);
  });
});
