import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

const VALID_GST = '27AABCU9603R1ZM';

describe('Employer verification', () => {
  it('verifies a company with a valid GSTIN', async () => {
    const { cookies } = await createAuthedUser('employer');
    const company = await createCompany(cookies, 'Verify Corp');
    expect(company.verificationStatus).toBe('unverified');

    const res = await api()
      .post(`/api/v1/company/${company._id}/verify`)
      .set('Cookie', cookies)
      .send({ gstNumber: VALID_GST });

    expect(res.status).toBe(200);
    expect(res.body.data.company.verificationStatus).toBe('verified');
  });

  it('rejects an invalid GSTIN format', async () => {
    const { cookies } = await createAuthedUser('employer');
    const company = await createCompany(cookies, 'Bad GST Corp');

    const res = await api()
      .post(`/api/v1/company/${company._id}/verify`)
      .set('Cookie', cookies)
      .send({ gstNumber: 'NOT-A-GST' });

    expect(res.status).toBe(400);
  });

  it("blocks verifying another employer's company (IDOR)", async () => {
    const owner = await createAuthedUser('employer');
    const company = await createCompany(owner.cookies, 'Owned Corp');

    const attacker = await createAuthedUser('employer');
    const res = await api()
      .post(`/api/v1/company/${company._id}/verify`)
      .set('Cookie', attacker.cookies)
      .send({ gstNumber: VALID_GST });

    expect(res.status).toBe(403);
  });
});

describe('Report a job', () => {
  async function setupJob() {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `Rep Corp ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id);
    return jobRes.body.data.job._id as string;
  }

  it('lets an employee report a job once', async () => {
    const jobId = await setupJob();
    const employee = await createAuthedUser('employee');

    const res = await api()
      .post(`/api/v1/job/${jobId}/report`)
      .set('Cookie', employee.cookies)
      .send({ reason: 'fake', note: 'Looks like a scam' });

    expect(res.status).toBe(201);
    expect(res.body.data.reported).toBe(true);
    expect(res.body.data.flagged).toBe(false);
  });

  it('rejects a duplicate report from the same user', async () => {
    const jobId = await setupJob();
    const employee = await createAuthedUser('employee');

    await api().post(`/api/v1/job/${jobId}/report`).set('Cookie', employee.cookies).send({ reason: 'fake' });
    const dup = await api()
      .post(`/api/v1/job/${jobId}/report`)
      .set('Cookie', employee.cookies)
      .send({ reason: 'fake' });

    expect(dup.status).toBe(409);
  });

  it('flags and hides a job after enough reports', async () => {
    const jobId = await setupJob();

    // Three distinct workers report it (threshold = 3)
    for (let i = 0; i < 3; i += 1) {
      const worker = await createAuthedUser('employee');
      const res = await api()
        .post(`/api/v1/job/${jobId}/report`)
        .set('Cookie', worker.cookies)
        .send({ reason: 'asks_for_money' });
      if (i === 2) expect(res.body.data.flagged).toBe(true);
    }

    // Flagged job no longer appears in public listings
    const list = await api().get('/api/v1/job').query({ limit: '100' });
    const ids = list.body.data.map((j: { _id: string }) => j._id);
    expect(ids).not.toContain(jobId);
  });

  it('rejects employers reporting jobs (RBAC)', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `RBAC Rep ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id);

    const res = await api()
      .post(`/api/v1/job/${jobRes.body.data.job._id}/report`)
      .set('Cookie', employer.cookies)
      .send({ reason: 'fake' });

    expect(res.status).toBe(403);
  });
});
