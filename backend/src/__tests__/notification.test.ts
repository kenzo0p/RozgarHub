import { describe, it, expect, beforeAll } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';
import { registerEventHandlers } from '../events/handlers.js';

// Notifications are created by async event handlers (fire-and-forget), so
// they land shortly AFTER the triggering response. Poll instead of sleeping.
async function waitFor<T>(fn: () => Promise<T>, predicate: (v: T) => boolean, timeoutMs = 5000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await fn();
    if (predicate(value)) return value;
    if (Date.now() > deadline) return value;
    await new Promise((r) => setTimeout(r, 50));
  }
}

beforeAll(() => {
  // In production this happens in index.ts at startup; tests import only the app
  registerEventHandlers();
});

describe('Notifications (event-driven)', () => {
  it('notifies the employer when someone applies to their job', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `NotifCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id);
    const employee = await createAuthedUser('employee');

    await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', employee.cookies);

    const res = await waitFor(
      () => api().get('/api/v1/notifications').set('Cookie', employer.cookies),
      (r) => r.body.data?.some(
        (n: { type: string }) => n.type === 'application_received',
      ) === true,
    );

    const received = res.body.data.find(
      (n: { type: string }) => n.type === 'application_received',
    );
    expect(received).toBeDefined();
    expect(received.isRead).toBe(false);
  });

  it('notifies the applicant when their application is accepted', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `NotifCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id);
    const employee = await createAuthedUser('employee');

    const applyRes = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', employee.cookies);

    await api()
      .patch(`/api/v1/application/${applyRes.body.data.application._id}/status`)
      .set('Cookie', employer.cookies)
      .send({ status: 'accepted' });

    const res = await waitFor(
      () => api().get('/api/v1/notifications').set('Cookie', employee.cookies),
      (r) => r.body.data?.some(
        (n: { type: string }) => n.type === 'application_accepted',
      ) === true,
    );

    expect(
      res.body.data.some((n: { type: string }) => n.type === 'application_accepted'),
    ).toBe(true);
  });

  it('tracks unread count and mark-all-as-read', async () => {
    const { cookies } = await createAuthedUser('employee');

    // Registration emits user.registered → welcome notification
    const countRes = await waitFor(
      () => api().get('/api/v1/notifications/unread-count').set('Cookie', cookies),
      (r) => r.body.data?.unreadCount > 0,
    );
    expect(countRes.body.data.unreadCount).toBeGreaterThan(0);

    const markRes = await api()
      .patch('/api/v1/notifications/read-all')
      .set('Cookie', cookies);
    expect(markRes.status).toBe(200);

    const after = await api()
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', cookies);
    expect(after.body.data.unreadCount).toBe(0);
  });

  it("cannot delete another user's notification", async () => {
    const alice = await createAuthedUser('employee');
    const mallory = await createAuthedUser('employee');

    const aliceNotifs = await waitFor(
      () => api().get('/api/v1/notifications').set('Cookie', alice.cookies),
      (r) => r.body.data?.length > 0,
    );
    const notifId = aliceNotifs.body.data[0]._id;

    // Delete is scoped by recipient — another user's attempt is a no-op
    await api().delete(`/api/v1/notifications/${notifId}`).set('Cookie', mallory.cookies);

    const stillThere = await api()
      .get('/api/v1/notifications')
      .set('Cookie', alice.cookies);
    expect(
      stillThere.body.data.some((n: { _id: string }) => n._id === notifId),
    ).toBe(true);
  });
});
