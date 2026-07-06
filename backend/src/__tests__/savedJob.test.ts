import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

async function setupJob() {
  const employer = await createAuthedUser('employer');
  const company = await createCompany(employer.cookies, `SaveCo ${Date.now()}${Math.random()}`);
  const jobRes = await createJob(employer.cookies, company._id);
  return { employer, jobId: jobRes.body.data.job._id as string };
}

describe('Saved Jobs', () => {
  it('saves a job and reflects it in ids, check, and list endpoints', async () => {
    const { jobId } = await setupJob();
    const employee = await createAuthedUser('employee');

    const saveRes = await api()
      .post(`/api/v1/saved-jobs/save/${jobId}`)
      .set('Cookie', employee.cookies);
    expect(saveRes.status).toBe(201);

    const idsRes = await api().get('/api/v1/saved-jobs/ids').set('Cookie', employee.cookies);
    expect(idsRes.body.data.jobIds).toContain(jobId);

    const checkRes = await api()
      .get(`/api/v1/saved-jobs/check/${jobId}`)
      .set('Cookie', employee.cookies);
    expect(checkRes.body.data.isSaved).toBe(true);

    const listRes = await api().get('/api/v1/saved-jobs').set('Cookie', employee.cookies);
    expect(listRes.status).toBe(200);
    expect(listRes.body.meta.total).toBe(1);
  });

  it('unsaves a job', async () => {
    const { jobId } = await setupJob();
    const employee = await createAuthedUser('employee');

    await api().post(`/api/v1/saved-jobs/save/${jobId}`).set('Cookie', employee.cookies);
    const unsaveRes = await api()
      .delete(`/api/v1/saved-jobs/unsave/${jobId}`)
      .set('Cookie', employee.cookies);
    expect(unsaveRes.status).toBe(200);

    const checkRes = await api()
      .get(`/api/v1/saved-jobs/check/${jobId}`)
      .set('Cookie', employee.cookies);
    expect(checkRes.body.data.isSaved).toBe(false);
  });

  it("does not leak one user's saved jobs to another", async () => {
    const { jobId } = await setupJob();
    const alice = await createAuthedUser('employee');
    const bob = await createAuthedUser('employee');

    await api().post(`/api/v1/saved-jobs/save/${jobId}`).set('Cookie', alice.cookies);

    const bobIds = await api().get('/api/v1/saved-jobs/ids').set('Cookie', bob.cookies);
    expect(bobIds.body.data.jobIds).not.toContain(jobId);
  });

  it('blocks employers from the saved-jobs endpoints (RBAC)', async () => {
    const { jobId, employer } = await setupJob();

    const res = await api()
      .post(`/api/v1/saved-jobs/save/${jobId}`)
      .set('Cookie', employer.cookies);
    expect(res.status).toBe(403);
  });
});
