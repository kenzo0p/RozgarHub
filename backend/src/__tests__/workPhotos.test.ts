import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, createAuthedUser } from './helpers.js';
import { uploadService } from '../services/upload.service.js';

// Cloudinary isn't reachable in tests — stub the actual upload so the endpoint
// logic (validation, cap, append) is exercised with a predictable URL.
beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(uploadService, 'uploadWorkPhoto').mockImplementation(async () =>
    `https://cdn.test/${Math.random().toString(36).slice(2)}.jpg`,
  );
});

const img = Buffer.from('fake-image-bytes');

describe('Work photos', () => {
  it('lets a worker add photos and returns them on the profile', async () => {
    const { cookies } = await createAuthedUser('employee');

    const res = await api()
      .post('/api/v1/user/work-photos')
      .set('Cookie', cookies)
      .attach('photos', img, 'a.jpg')
      .attach('photos', img, 'b.jpg');

    expect(res.status).toBe(200);
    expect(res.body.data.user.profile.workPhotos).toHaveLength(2);
  });

  it('removes a photo by URL', async () => {
    const { cookies } = await createAuthedUser('employee');
    const add = await api()
      .post('/api/v1/user/work-photos')
      .set('Cookie', cookies)
      .attach('photos', img, 'a.jpg');
    const url = add.body.data.user.profile.workPhotos[0];

    const res = await api()
      .delete('/api/v1/user/work-photos')
      .set('Cookie', cookies)
      .send({ url });

    expect(res.status).toBe(200);
    expect(res.body.data.user.profile.workPhotos).not.toContain(url);
  });

  it('enforces the 8-photo cap', async () => {
    const { cookies } = await createAuthedUser('employee');
    // First 8 succeed
    let req = api().post('/api/v1/user/work-photos').set('Cookie', cookies);
    for (let i = 0; i < 8; i++) req = req.attach('photos', img, `p${i}.jpg`);
    const ok = await req;
    expect(ok.status).toBe(200);
    expect(ok.body.data.user.profile.workPhotos).toHaveLength(8);

    // The 9th is rejected
    const over = await api()
      .post('/api/v1/user/work-photos')
      .set('Cookie', cookies)
      .attach('photos', img, 'p9.jpg');
    expect(over.status).toBe(400);
  });

  it('is worker-only', async () => {
    const { cookies } = await createAuthedUser('employer');
    const res = await api()
      .post('/api/v1/user/work-photos')
      .set('Cookie', cookies)
      .attach('photos', img, 'a.jpg');
    expect(res.status).toBe(403);
  });

  it('surfaces work photos in employer worker search', async () => {
    const worker = await createAuthedUser('employee');
    await api()
      .put('/api/v1/user/profile/update')
      .set('Cookie', worker.cookies)
      .send({ primaryTrade: 'Painter' });
    await api()
      .post('/api/v1/user/work-photos')
      .set('Cookie', worker.cookies)
      .attach('photos', img, 'a.jpg');

    const employer = await createAuthedUser('employer');
    const res = await api()
      .get('/api/v1/user/workers?trade=Painter')
      .set('Cookie', employer.cookies);

    const found = res.body.data.find(
      (w: { profile: { workPhotos?: string[] } }) => (w.profile.workPhotos?.length ?? 0) > 0,
    );
    expect(found).toBeDefined();
  });
});
