import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

describe('Occupation credentials', () => {
  it('adds a driving licence on a valid format and marks it verified', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/user/credentials')
      .set('Cookie', cookies)
      .field('type', 'driving_license')
      .field('number', 'MH12 2015 0001234');

    expect(res.status).toBe(200);
    const creds = res.body.data.user.profile.credentials;
    expect(creds).toHaveLength(1);
    expect(creds[0].type).toBe('driving_license');
    expect(creds[0].status).toBe('verified');
    expect(creds[0].number).toBe('MH1220150001234'); // normalized
  });

  it('rejects an invalid driving licence number', async () => {
    const { cookies } = await createAuthedUser('employee');
    const res = await api()
      .post('/api/v1/user/credentials')
      .set('Cookie', cookies)
      .field('type', 'driving_license')
      .field('number', 'not-a-licence');
    expect(res.status).toBe(400);
  });

  it('is worker-only', async () => {
    const { cookies } = await createAuthedUser('employer');
    const res = await api()
      .post('/api/v1/user/credentials')
      .set('Cookie', cookies)
      .field('type', 'certificate')
      .field('number', 'CERT-123');
    expect(res.status).toBe(403);
  });

  it('blocks applying to a job that requires a credential the worker lacks', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `CredCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Delivery Driver', {
      requiredCredential: 'driving_license',
    });
    const worker = await createAuthedUser('employee');

    const res = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/driving licence/i);
  });

  it('allows applying once the worker adds the required credential', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `CredCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Truck Driver', {
      requiredCredential: 'driving_license',
    });
    const worker = await createAuthedUser('employee');

    await api()
      .post('/api/v1/user/credentials')
      .set('Cookie', worker.cookies)
      .field('type', 'driving_license')
      .field('number', 'DL0120199999999');

    const res = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);

    expect(res.status).toBe(201);
  });

  it('does not gate jobs without a required credential', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `CredCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Helper');
    const worker = await createAuthedUser('employee');

    const res = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);
    expect(res.status).toBe(201);
  });

  it('blocks applying until the worker has verified their identity', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `CredCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Helper');
    // Unverified worker — should be blocked at the identity gate.
    const worker = await createAuthedUser('employee', { verified: false });

    const blocked = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);
    expect(blocked.status).toBe(403);
    expect(blocked.body.message).toMatch(/identity|aadhaar/i);

    // After verifying, the same worker can apply.
    await api()
      .post('/api/v1/user/verify')
      .set('Cookie', worker.cookies)
      .send({ idNumber: '234567890123' });

    const ok = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);
    expect(ok.status).toBe(201);
  });

  it('removes a credential by id', async () => {
    const { cookies } = await createAuthedUser('employee');
    const add = await api()
      .post('/api/v1/user/credentials')
      .set('Cookie', cookies)
      .field('type', 'certificate')
      .field('number', 'ITI-2020-5566');
    const id = add.body.data.user.profile.credentials[0]._id;

    const res = await api().delete(`/api/v1/user/credentials/${id}`).set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.user.profile.credentials).toHaveLength(0);
  });
});
