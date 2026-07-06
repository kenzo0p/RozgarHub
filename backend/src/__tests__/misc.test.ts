import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

describe('User Profile', () => {
  it('updates bio and skills', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .put('/api/v1/user/profile/update')
      .set('Cookie', cookies)
      .send({ bio: 'Full-stack developer', skills: 'node, react, mongodb' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.profile.bio).toBe('Full-stack developer');
    expect(res.body.data.user.profile.skills).toEqual(['node', 'react', 'mongodb']);
  });

  it("rejects taking another user's email with 409", async () => {
    const alice = await createAuthedUser('employee');
    const bob = await createAuthedUser('employee');

    const res = await api()
      .put('/api/v1/user/profile/update')
      .set('Cookie', bob.cookies)
      .send({ email: alice.creds.email });

    expect(res.status).toBe(409);
  });
});

describe('Analytics', () => {
  it('serves platform stats publicly', async () => {
    const res = await api().get('/api/v1/analytics/platform');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('restricts the employer dashboard to employers', async () => {
    const employee = await createAuthedUser('employee');
    const denied = await api()
      .get('/api/v1/analytics/employer')
      .set('Cookie', employee.cookies);
    expect(denied.status).toBe(403);

    const employer = await createAuthedUser('employer');
    const allowed = await api()
      .get('/api/v1/analytics/employer')
      .set('Cookie', employer.cookies);
    expect(allowed.status).toBe(200);
  });
});

describe('Recommendations', () => {
  it('recommends jobs matching the user profile skills', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `RecCo ${Math.random()}`);
    await createJob(employer.cookies, company._id, 'Node.js Backend Engineer');

    const employee = await createAuthedUser('employee');
    await api()
      .put('/api/v1/user/profile/update')
      .set('Cookie', employee.cookies)
      .send({ skills: 'node.js, mongodb' });

    const res = await api()
      .get('/api/v1/recommendations/jobs')
      .set('Cookie', employee.cookies);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('returns an empty list when the user has no skills', async () => {
    const employee = await createAuthedUser('employee');

    const res = await api()
      .get('/api/v1/recommendations/jobs')
      .set('Cookie', employee.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.recommendations).toEqual([]);
  });
});

describe('Health', () => {
  it('reports readiness with dependency checks', async () => {
    const res = await api().get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.checks.mongodb.status).toBe('healthy');
  });
});
