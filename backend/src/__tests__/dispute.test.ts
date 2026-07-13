import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

/** Set up an accepted engagement (dispute-eligible). */
async function acceptedEngagement() {
  const employer = await createAuthedUser('employer');
  const company = await createCompany(employer.cookies, `DisCo ${Math.random()}`);
  const jobRes = await createJob(employer.cookies, company._id, 'Carpenter');
  const worker = await createAuthedUser('employee');

  const applyRes = await api()
    .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
    .set('Cookie', worker.cookies);
  const applicationId = applyRes.body.data.application._id;

  await api()
    .patch(`/api/v1/application/${applicationId}/status`)
    .set('Cookie', employer.cookies)
    .send({ status: 'accepted' });

  return { employer, worker, applicationId };
}

describe('Disputes', () => {
  it('lets a worker raise a dispute against the employer', async () => {
    const { worker, applicationId } = await acceptedEngagement();

    const res = await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'not_paid', description: 'Did not receive payment.' });

    expect(res.status).toBe(201);
    expect(res.body.data.dispute.reason).toBe('not_paid');
    expect(res.body.data.dispute.raisedByRole).toBe('employee');
  });

  it('shows the dispute to both parties via /mine', async () => {
    const { worker, employer, applicationId } = await acceptedEngagement();
    await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'unsafe' });

    const workerView = await api().get('/api/v1/disputes/mine').set('Cookie', worker.cookies);
    const employerView = await api().get('/api/v1/disputes/mine').set('Cookie', employer.cookies);

    expect(workerView.body.data.disputes.length).toBe(1);
    expect(employerView.body.data.disputes.length).toBe(1);
  });

  it('blocks a second dispute from the same party on the same engagement', async () => {
    const { worker, applicationId } = await acceptedEngagement();
    await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'not_paid' });

    const dup = await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'underpaid' });
    expect(dup.status).toBe(409);
  });

  it('refuses a dispute on a non-engaged application', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `DisCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Fitter');
    const worker = await createAuthedUser('employee');
    const applyRes = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', worker.cookies);

    const res = await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId: applyRes.body.data.application._id, reason: 'not_paid' });
    expect(res.status).toBe(403);
  });

  it('refuses a dispute from a non-participant', async () => {
    const { applicationId } = await acceptedEngagement();
    const outsider = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/disputes')
      .set('Cookie', outsider.cookies)
      .send({ applicationId, reason: 'other' });
    expect(res.status).toBe(403);
  });

  it('reports which engagements the caller has already disputed', async () => {
    const { worker, applicationId } = await acceptedEngagement();
    await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'not_paid' });

    const res = await api().get('/api/v1/disputes/mine/raised-ids').set('Cookie', worker.cookies);
    expect(res.body.data.applicationIds).toContain(applicationId);
  });

  it('validates the reason', async () => {
    const { worker, applicationId } = await acceptedEngagement();
    const res = await api()
      .post('/api/v1/disputes')
      .set('Cookie', worker.cookies)
      .send({ applicationId, reason: 'bogus' });
    expect(res.status).toBe(400);
  });
});
