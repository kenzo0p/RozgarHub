import { describe, it, expect } from 'vitest';
import { api, createAuthedUser } from './helpers.js';

const jobBody = {
  title: 'Personal Driver',
  description: 'Looking for a driver for my own car in Pune. Daily driving.',
  requirements: 'Valid licence',
  salary: 18000,
  wageType: 'monthly',
  location: 'Pune',
  jobType: 'Full-Time',
  position: 1,
  experience: 2,
};

describe('Individual (household) employers', () => {
  it('lets an employer post a job with no company', async () => {
    const employer = await createAuthedUser('employer');

    const res = await api()
      .post('/api/v1/job')
      .set('Cookie', employer.cookies)
      .send(jobBody);

    expect(res.status).toBe(201);
    expect(res.body.data.job.company).toBeFalsy();
    expect(res.body.data.job.title).toBe('Personal Driver');
  });

  it('shows the individual poster on public listings without leaking their phone', async () => {
    const employer = await createAuthedUser('employer');
    await api().post('/api/v1/job').set('Cookie', employer.cookies).send(jobBody);

    const worker = await createAuthedUser('employee');
    const list = await api().get('/api/v1/job?keyword=Personal Driver').set('Cookie', worker.cookies);

    expect(list.status).toBe(200);
    const job = list.body.data.find((j: { title: string }) => j.title === 'Personal Driver');
    expect(job).toBeDefined();
    // The poster's name is shown…
    expect(job.created_By?.fullname).toBeTruthy();
    // …but their phone number is never populated into public listings.
    expect(JSON.stringify(job.created_By)).not.toContain(String(employer.creds.phoneNumber));
  });

  it("shows the poster's name in the worker's applied-jobs list without the phone", async () => {
    const employer = await createAuthedUser('employer');
    const posted = await api().post('/api/v1/job').set('Cookie', employer.cookies).send(jobBody);
    const jobId = posted.body.data.job._id;

    const worker = await createAuthedUser('employee');
    const applied = await api()
      .post(`/api/v1/application/apply/${jobId}`)
      .set('Cookie', worker.cookies);
    expect(applied.status).toBe(201);

    const mine = await api().get('/api/v1/application').set('Cookie', worker.cookies);
    expect(mine.status).toBe(200);
    const row = mine.body.data.applications.find(
      (a: { job?: { _id: string } }) => a.job?._id === jobId,
    );
    expect(row).toBeDefined();
    // Individual job: no company, but the poster's name still shows…
    expect(row.job.company).toBeFalsy();
    expect(row.job.posterName).toBe(employer.creds.fullname);
    // …while the phone-bearing employer object never ships (pending status).
    expect(row.job.created_By).toBeUndefined();
    expect(JSON.stringify(row)).not.toContain(String(employer.creds.phoneNumber));
  });

  it('still rejects a business job posted under a non-existent company', async () => {
    const employer = await createAuthedUser('employer');
    const res = await api()
      .post('/api/v1/job')
      .set('Cookie', employer.cookies)
      .send({ ...jobBody, companyId: '6a55ffa54a9442bb1321f8da' });
    expect(res.status).toBe(404);
  });

  it('lets an employer verify their identity (Aadhaar) — no longer worker-only', async () => {
    const employer = await createAuthedUser('employer');

    const res = await api()
      .post('/api/v1/user/verify')
      .set('Cookie', employer.cookies)
      .send({ idNumber: '234567890123' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.verificationStatus).toBe('verified');
  });

  it('stores employerType chosen at signup', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({
        fullname: 'Om Individual',
        username: `om_${Date.now()}`,
        email: `om_${Date.now()}@example.com`,
        password: 'password123',
        phoneNumber: String(9700000000 + Math.floor(Math.random() * 8999999)),
        role: 'employer',
        employerType: 'individual',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.employerType).toBe('individual');
  });
});
