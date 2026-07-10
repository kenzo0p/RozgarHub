import { describe, it, expect } from 'vitest';
import { api, createAuthedUser, createCompany, createJob } from './helpers.js';

/**
 * Set up an accepted engagement and return the ids/cookies both parties need.
 */
async function acceptedEngagement() {
  const employer = await createAuthedUser('employer');
  const company = await createCompany(employer.cookies, `RevCo ${Math.random()}`);
  const jobRes = await createJob(employer.cookies, company._id, 'Welder');
  const jobId = jobRes.body.data.job._id;
  const employee = await createAuthedUser('employee');

  const applyRes = await api()
    .post(`/api/v1/application/apply/${jobId}`)
    .set('Cookie', employee.cookies);
  const applicationId = applyRes.body.data.application._id;

  await api()
    .patch(`/api/v1/application/${applicationId}/status`)
    .set('Cookie', employer.cookies)
    .send({ status: 'accepted' });

  return { employer, employee, jobId, applicationId };
}

describe('Reviews', () => {
  it('lets a worker review the employer after being accepted', async () => {
    const { employer, employee, applicationId } = await acceptedEngagement();

    const res = await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId, rating: 5, comment: 'Paid on time, safe site.' });

    expect(res.status).toBe(201);
    expect(res.body.data.review.rating).toBe(5);

    // The employer's aggregate rating is updated
    const reviewsRes = await api()
      .get(`/api/v1/reviews/user/${employer.user._id}`)
      .set('Cookie', employee.cookies);
    expect(reviewsRes.status).toBe(200);
    expect(reviewsRes.body.data.summary.count).toBe(1);
    expect(reviewsRes.body.data.summary.average).toBe(5);
    expect(reviewsRes.body.data.reviews[0].comment).toBe('Paid on time, safe site.');
  });

  it('lets the employer review the worker, and updates the worker aggregate', async () => {
    const { employer, employee, applicationId } = await acceptedEngagement();

    await api()
      .post('/api/v1/reviews')
      .set('Cookie', employer.cookies)
      .send({ applicationId, rating: 4 });

    const profile = await api()
      .get('/api/v1/user/profile')
      .set('Cookie', employee.cookies);
    expect(profile.body.data.user.ratingCount).toBe(1);
    expect(profile.body.data.user.ratingAverage).toBe(4);
  });

  it('rejects a second review of the same engagement by the same party', async () => {
    const { employee, applicationId } = await acceptedEngagement();

    await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId, rating: 5 });

    const dup = await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId, rating: 3 });

    expect(dup.status).toBe(409);
  });

  it('refuses a review when the application is not accepted', async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `RevCo ${Math.random()}`);
    const jobRes = await createJob(employer.cookies, company._id, 'Painter');
    const employee = await createAuthedUser('employee');

    const applyRes = await api()
      .post(`/api/v1/application/apply/${jobRes.body.data.job._id}`)
      .set('Cookie', employee.cookies);

    const res = await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId: applyRes.body.data.application._id, rating: 5 });

    expect(res.status).toBe(403);
  });

  it('refuses a review from someone who was not part of the engagement', async () => {
    const { applicationId } = await acceptedEngagement();
    const outsider = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/reviews')
      .set('Cookie', outsider.cookies)
      .send({ applicationId, rating: 1 });

    expect(res.status).toBe(403);
  });

  it('validates the rating range', async () => {
    const { employee, applicationId } = await acceptedEngagement();

    const res = await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId, rating: 6 });

    expect(res.status).toBe(400);
  });

  it('reports which engagements the caller has already reviewed', async () => {
    const { employee, applicationId } = await acceptedEngagement();

    await api()
      .post('/api/v1/reviews')
      .set('Cookie', employee.cookies)
      .send({ applicationId, rating: 5 });

    const res = await api()
      .get('/api/v1/reviews/mine/given')
      .set('Cookie', employee.cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.applicationIds).toContain(applicationId);
  });
});
