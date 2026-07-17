import { describe, it, expect, vi } from 'vitest';
import { api, createAuthedUser, createCompany } from './helpers.js';
import { translateText } from '../utils/mt.js';

// The MT provider is external — mock it so tests are deterministic/offline.
vi.mock('../utils/mt.js', () => ({
  translateText: vi.fn(async (text: string, lang: string) => `[${lang}] ${text}`),
}));

const mockedTranslate = vi.mocked(translateText);

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

async function postJob() {
  const employer = await createAuthedUser('employer');
  const res = await api().post('/api/v1/job').set('Cookie', employer.cookies).send(jobBody);
  expect(res.status).toBe(201);
  return res.body.data.job._id as string;
}

describe('Job content translation', () => {
  it('translates title/description/requirements into the requested language', async () => {
    const jobId = await postJob();
    const worker = await createAuthedUser('employee');

    const res = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=hi`)
      .set('Cookie', worker.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.translated).toBe(true);
    expect(res.body.data.title).toBe('[hi] Personal Driver');
    expect(res.body.data.description).toContain('[hi]');
    expect(res.body.data.requirements).toBe('[hi] Valid licence');
  });

  it('serves the second request from cache without calling the provider again', async () => {
    const jobId = await postJob();
    const worker = await createAuthedUser('employee');

    await api().get(`/api/v1/job/${jobId}/translation?lang=ta`).set('Cookie', worker.cookies);
    const callsAfterFirst = mockedTranslate.mock.calls.length;

    const second = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=ta`)
      .set('Cookie', worker.cookies);

    expect(second.status).toBe(200);
    expect(second.body.data.translated).toBe(true);
    expect(second.body.data.title).toBe('[ta] Personal Driver');
    expect(mockedTranslate.mock.calls.length).toBe(callsAfterFirst);
  });

  it("translates the posting company's description too", async () => {
    const employer = await createAuthedUser('employer');
    const company = await createCompany(employer.cookies, `MT Movers ${Date.now()}`);
    const upd = await api()
      .put(`/api/v1/company/${company._id}`)
      .set('Cookie', employer.cookies)
      .field('description', 'Trusted moving and packing services across Pune.');
    expect(upd.status).toBe(200);

    const posted = await api()
      .post('/api/v1/job')
      .set('Cookie', employer.cookies)
      .send({ ...jobBody, companyId: company._id });
    expect(posted.status).toBe(201);

    const worker = await createAuthedUser('employee');
    const res = await api()
      .get(`/api/v1/job/${posted.body.data.job._id}/translation?lang=hi`)
      .set('Cookie', worker.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.translated).toBe(true);
    expect(res.body.data.companyDescription).toBe(
      '[hi] Trusted moving and packing services across Pune.',
    );
  });

  it('rejects unsupported languages (including en, the source)', async () => {
    const jobId = await postJob();
    const worker = await createAuthedUser('employee');

    const en = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=en`)
      .set('Cookie', worker.cookies);
    expect(en.status).toBe(400);

    const bogus = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=fr`)
      .set('Cookie', worker.cookies);
    expect(bogus.status).toBe(400);
  });

  it('degrades gracefully (translated: false) when the provider is down', async () => {
    const jobId = await postJob();
    const worker = await createAuthedUser('employee');

    mockedTranslate.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const res = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=bn`)
      .set('Cookie', worker.cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.translated).toBe(false);
    expect(res.body.data.title).toBeUndefined();

    // Failure was not cached — a retry with a healthy provider translates.
    const retry = await api()
      .get(`/api/v1/job/${jobId}/translation?lang=bn`)
      .set('Cookie', worker.cookies);
    expect(retry.body.data.translated).toBe(true);
    expect(retry.body.data.title).toBe('[bn] Personal Driver');
  });
});
