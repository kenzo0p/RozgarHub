import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

describe('Jobs', () => {
  describe('POST /job', () => {
    it('lets an employer post a job for their own company', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Acme Corp');

      const res = await createJob(cookies, company._id);

      expect(res.status).toBe(201);
      expect(res.body.data.job.title).toBe('Backend Engineer');
    });

    it("rejects posting a job under another employer's company (IDOR)", async () => {
      const owner = await createAuthedUser('employer');
      const company = await createCompany(owner.cookies, 'Owned Corp');

      const attacker = await createAuthedUser('employer');
      const res = await createJob(attacker.cookies, company._id);

      expect(res.status).toBe(403);
    });

    it('rejects employees from posting jobs (RBAC)', async () => {
      const employer = await createAuthedUser('employer');
      const company = await createCompany(employer.cookies, 'Rbac Corp');

      const employee = await createAuthedUser('employee');
      const res = await createJob(employee.cookies, company._id);

      expect(res.status).toBe(403);
    });
  });

  describe('Wage type', () => {
    it('stores the wage type and defaults to monthly', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Wage Corp');

      const daily = await createJob(cookies, company._id, 'Daily Laborer', {
        salary: 600,
        wageType: 'daily',
      });
      expect(daily.status).toBe(201);
      expect(daily.body.data.job.wageType).toBe('daily');

      const def = await createJob(cookies, company._id, 'Default Wage Job');
      expect(def.body.data.job.wageType).toBe('monthly');
    });

    it('filters jobs by wage type', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Filter Wage Corp');
      await createJob(cookies, company._id, 'Daily Job', { wageType: 'daily', salary: 700 });
      await createJob(cookies, company._id, 'Monthly Job', { wageType: 'monthly', salary: 20000 });

      const res = await api().get('/api/v1/job').query({ wageType: 'daily' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Daily Job');
    });
  });

  describe('Geo (near me)', () => {
    it('returns jobs within the radius and excludes far ones', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Geo Corp');
      // Pune job (geocoded from location string) and a Chennai job
      await createJob(cookies, company._id, 'Pune Welder', { location: 'Pune' });
      await createJob(cookies, company._id, 'Chennai Welder', { location: 'Chennai' });

      // Search near Pune (18.52, 73.85) within 50km — should find only the Pune job
      const res = await api()
        .get('/api/v1/job')
        .query({ lat: '18.5204', lng: '73.8567', radius: '50' });

      expect(res.status).toBe(200);
      const titles = res.body.data.map((j: { title: string }) => j.title);
      expect(titles).toContain('Pune Welder');
      expect(titles).not.toContain('Chennai Welder');
    });
  });

  describe('GET /job (search)', () => {
    it('handles regex metacharacters in keyword search without erroring', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Search Corp');
      await createJob(cookies, company._id, 'C++ Developer');

      const res = await api().get('/api/v1/job').query({ keyword: 'C++' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('C++ Developer');
    });

    it('is publicly accessible and paginated', async () => {
      const { cookies } = await createAuthedUser('employer');
      const company = await createCompany(cookies, 'Page Corp');
      await createJob(cookies, company._id, 'Job One');
      await createJob(cookies, company._id, 'Job Two');

      const res = await api().get('/api/v1/job').query({ limit: '1' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(2);
    });
  });

  describe('GET /job/:id', () => {
    it('returns viewer-specific state without exposing the applications list', async () => {
      const employer = await createAuthedUser('employer');
      const company = await createCompany(employer.cookies, 'Detail Corp');
      const jobRes = await createJob(employer.cookies, company._id);
      const jobId = jobRes.body.data.job._id;

      const employee = await createAuthedUser('employee');
      const res = await api().get(`/api/v1/job/${jobId}`).set('Cookie', employee.cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.isApplied).toBe(false);
      expect(res.body.data.totalApplications).toBe(0);
    });

    it('requires authentication', async () => {
      const res = await api().get('/api/v1/job/000000000000000000000000');
      expect(res.status).toBe(401);
    });
  });
});
