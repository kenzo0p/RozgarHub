import { describe, it, expect, beforeAll } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';
import { registerEventHandlers } from '../events/handlers.js';
import { tn } from '../utils/notificationI18n.js';

// Notifications land via async event handlers shortly after the response.
async function waitFor<T>(
  fn: () => Promise<T>,
  predicate: (v: T) => boolean,
  timeoutMs = 5000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await fn();
    if (predicate(value)) return value;
    if (Date.now() > deadline) return value;
    await new Promise((r) => setTimeout(r, 50));
  }
}

beforeAll(() => {
  registerEventHandlers();
});

describe('Language preference', () => {
  it('updates the user language via PATCH /user/language', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .patch('/api/v1/user/language')
      .set('Cookie', cookies)
      .send({ language: 'ta' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.language).toBe('ta');
  });

  it('rejects an unsupported language', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .patch('/api/v1/user/language')
      .set('Cookie', cookies)
      .send({ language: 'xx' });

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await api().patch('/api/v1/user/language').send({ language: 'hi' });
    expect(res.status).toBe(401);
  });
});

describe('Localized notifications', () => {
  it('renders the accept notification in the worker’s chosen language', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `LangCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Electrician');
    const employee = await createAuthedUser('employee');

    // Worker chooses Hindi before the decision is made
    await api()
      .patch('/api/v1/user/language')
      .set('Cookie', employee.cookies)
      .send({ language: 'hi' });

    const applyRes = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', employee.cookies);

    await api()
      .patch(`/api/v1/application/${applyRes.body.data.application._id}/status`)
      .set('Cookie', employer.cookies)
      .send({ status: 'accepted' });

    const res = await waitFor(
      () => api().get('/api/v1/notifications').set('Cookie', employee.cookies),
      (r) =>
        r.body.data?.some(
          (n: { type: string }) => n.type === 'application_accepted',
        ) === true,
    );

    const accepted = res.body.data.find(
      (n: { type: string }) => n.type === 'application_accepted',
    );
    expect(accepted).toBeDefined();
    // Message must match the Hindi translation, not the English default
    expect(accepted.message).toBe(
      tn('hi', 'application_accepted.message', { jobTitle: 'Electrician' }),
    );
    expect(accepted.title).toBe(tn('hi', 'application_accepted.title'));
  });
});
