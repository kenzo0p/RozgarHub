import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

/** Drive an application to a given lifecycle status, returning ids/cookies. */
async function driveTo(target: string) {
  const employer = await createAuthedUser('employer');
  const company = await createCompany(employer.cookies, `PayCo ${Math.random()}`);
  const jobRes = await createJob(employer.cookies, company._id, 'Mason');
  const worker = await createAuthedUser('employee');

  const applyRes = await api()
    .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
    .set('Cookie', worker.cookies);
  const applicationId = applyRes.body.data.application._id;

  const path = ['accepted', 'started', 'completed', 'paid'];
  for (const status of path) {
    await api()
      .patch(`/api/v1/application/${applicationId}/status`)
      .set('Cookie', employer.cookies)
      .send(status === 'paid' ? { status, paidAmount: 1500, paymentMethod: 'upi' } : { status });
    if (status === target) break;
  }
  return { employer, worker, applicationId };
}

describe('Payment record + confirmation', () => {
  it('records the amount and method when the employer marks it paid', async () => {
    const { worker, applicationId } = await driveTo('paid');

    const applied = await api().get('/api/v1/application').set('Cookie', worker.cookies);
    const row = applied.body.data.applications.find(
      (a: { _id: string }) => a._id === applicationId,
    );
    expect(row).toBeDefined();
    expect(row.paidAmount).toBe(1500);
    expect(row.paymentMethod).toBe('upi');
    expect(row.paymentConfirmed).toBe(false);
  });

  it('lets the worker confirm receipt, and blocks others', async () => {
    const { worker, employer, applicationId } = await driveTo('paid');

    // Employer cannot confirm (worker-only action)
    const byEmployer = await api()
      .patch(`/api/v1/application/${applicationId}/confirm-payment`)
      .set('Cookie', employer.cookies);
    expect(byEmployer.status).toBe(403);

    const res = await api()
      .patch(`/api/v1/application/${applicationId}/confirm-payment`)
      .set('Cookie', worker.cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.application.paymentConfirmed).toBe(true);
    expect(res.body.data.application.paidAmount).toBe(1500);
    expect(res.body.data.application.paymentMethod).toBe('upi');
  });

  it('surfaces the payment record + confirmation in the worker applied list', async () => {
    const { worker, applicationId } = await driveTo('paid');
    await api()
      .patch(`/api/v1/application/${applicationId}/confirm-payment`)
      .set('Cookie', worker.cookies);

    const applied = await api().get('/api/v1/application').set('Cookie', worker.cookies);
    const row = applied.body.data.applications.find(
      (a: { _id: string }) => a._id === applicationId,
    );
    expect(row.status).toBe('paid');
    expect(row.paidAmount).toBe(1500);
    expect(row.paymentConfirmed).toBe(true);
  });

  it("refuses confirmation before the work is marked paid", async () => {
    const { worker, applicationId } = await driveTo('completed');

    const res = await api()
      .patch(`/api/v1/application/${applicationId}/confirm-payment`)
      .set('Cookie', worker.cookies);
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const { applicationId } = await driveTo('paid');
    const res = await api().patch(`/api/v1/application/${applicationId}/confirm-payment`);
    expect(res.status).toBe(401);
  });
});
