import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

/**
 * Creates an employer with a job, returning everything a test needs.
 */
async function setupJob() {
  const employer = await createAuthedUser('employer');
  const company = await createCompany(employer.cookies, `Corp ${Date.now()}${Math.random()}`);
  const jobRes = await createJob(employer.cookies, company._id);
  return { employer, company, jobId: jobRes.body.data.job._id as string };
}

describe('Employer contact reveal', () => {
  it('hides the employer contact until accepted, then reveals it', async () => {
    const { jobId, employer } = await setupJob();
    const employee = await createAuthedUser('employee');

    const applyRes = await api()
      .post(`/api/v1/application/apply/${jobId}`)
      .set('Cookie', employee.cookies);
    const applicationId = applyRes.body.data.application._id;

    // Pending → no contact
    const before = await api().get('/api/v1/application').set('Cookie', employee.cookies);
    expect(before.status).toBe(200);
    expect(before.body.data.applications[0].employerContact).toBeNull();

    // Accept
    await api()
      .patch(`/api/v1/application/${applicationId}/status`)
      .set('Cookie', employer.cookies)
      .send({ status: 'accepted' });

    // Accepted → contact present (falls back to employer's phone)
    const after = await api().get('/api/v1/application').set('Cookie', employee.cookies);
    expect(after.body.data.applications[0].employerContact).not.toBeNull();
    expect(after.body.data.applications[0].employerContact.phone).toMatch(/^\d{10}$/);
  });
});

describe('Applications', () => {
  describe('POST /application/apply/:id', () => {
    it('lets an employee apply to a job', async () => {
      const { jobId } = await setupJob();
      const employee = await createAuthedUser('employee');

      const res = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employee.cookies);

      expect(res.status).toBe(201);
      expect(res.body.data.application.status).toBe('pending');
    });

    it('rejects a duplicate application with 409', async () => {
      const { jobId } = await setupJob();
      const employee = await createAuthedUser('employee');

      await api().post(`/api/v1/application/apply/${jobId}`).set('Cookie', employee.cookies);
      const res = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employee.cookies);

      expect(res.status).toBe(409);
    });

    it('rejects employers from applying (RBAC)', async () => {
      const { jobId, employer } = await setupJob();

      const res = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employer.cookies);

      expect(res.status).toBe(403);
    });

    it('reflects the application in the job detail (isApplied)', async () => {
      const { jobId } = await setupJob();
      const employee = await createAuthedUser('employee');

      await api().post(`/api/v1/application/apply/${jobId}`).set('Cookie', employee.cookies);
      const res = await api().get(`/api/v1/job/${jobId}`).set('Cookie', employee.cookies);

      expect(res.body.data.isApplied).toBe(true);
      expect(res.body.data.totalApplications).toBe(1);
    });
  });

  describe('GET /application/:id/applicants', () => {
    it('lets the job owner view applicants', async () => {
      const { jobId, employer } = await setupJob();
      const employee = await createAuthedUser('employee');
      await api().post(`/api/v1/application/apply/${jobId}`).set('Cookie', employee.cookies);

      const res = await api()
        .get(`/api/v1/application/${jobId}/applicants`)
        .set('Cookie', employer.cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.job.applications).toHaveLength(1);
    });

    it("blocks other employers from viewing applicants (IDOR)", async () => {
      const { jobId } = await setupJob();
      const otherEmployer = await createAuthedUser('employer');

      const res = await api()
        .get(`/api/v1/application/${jobId}/applicants`)
        .set('Cookie', otherEmployer.cookies);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /application/:id/status', () => {
    it('lets the job owner accept an application', async () => {
      const { jobId, employer } = await setupJob();
      const employee = await createAuthedUser('employee');
      const applyRes = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employee.cookies);
      const applicationId = applyRes.body.data.application._id;

      const res = await api()
        .patch(`/api/v1/application/${applicationId}/status`)
        .set('Cookie', employer.cookies)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.data.application.status).toBe('accepted');
    });

    it("blocks other employers from changing application status (IDOR)", async () => {
      const { jobId } = await setupJob();
      const employee = await createAuthedUser('employee');
      const applyRes = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employee.cookies);
      const applicationId = applyRes.body.data.application._id;

      const otherEmployer = await createAuthedUser('employer');
      const res = await api()
        .patch(`/api/v1/application/${applicationId}/status`)
        .set('Cookie', otherEmployer.cookies)
        .send({ status: 'accepted' });

      expect(res.status).toBe(403);
    });

    it('rejects an invalid status value with 400', async () => {
      const { jobId, employer } = await setupJob();
      const employee = await createAuthedUser('employee');
      const applyRes = await api()
        .post(`/api/v1/application/apply/${jobId}`)
        .set('Cookie', employee.cookies);

      const res = await api()
        .patch(`/api/v1/application/${applyRes.body.data.application._id}/status`)
        .set('Cookie', employer.cookies)
        .send({ status: 'hired' });

      expect(res.status).toBe(400);
    });
  });
});
