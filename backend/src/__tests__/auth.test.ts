import { describe, it, expect } from 'vitest';
import { api, createAuthedUser } from './helpers.js';

const REGISTER_PAYLOAD = {
  fullname: 'Asha Kumar',
  username: 'ashakumar',
  email: 'asha@example.com',
  password: 'password123',
  phoneNumber: '9876543210',
  role: 'employee',
};

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('creates an account and never returns the password', async () => {
      const res = await api().post('/api/v1/auth/register').send(REGISTER_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('asha@example.com');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.passwordResetToken).toBeUndefined();
    });

    it('rejects a duplicate email with 409', async () => {
      await api().post('/api/v1/auth/register').send(REGISTER_PAYLOAD);
      const res = await api()
        .post('/api/v1/auth/register')
        .send({ ...REGISTER_PAYLOAD, username: 'differentname' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects an invalid payload with 400', async () => {
      const res = await api()
        .post('/api/v1/auth/register')
        .send({ ...REGISTER_PAYLOAD, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('sets httpOnly access and refresh cookies on success', async () => {
      await api().post('/api/v1/auth/register').send(REGISTER_PAYLOAD);
      const res = await api().post('/api/v1/auth/login').send({
        email: REGISTER_PAYLOAD.email,
        username: REGISTER_PAYLOAD.username,
        password: REGISTER_PAYLOAD.password,
        role: 'employee',
      });

      expect(res.status).toBe(200);
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookies).toContain('accessToken=');
      expect(cookies).toContain('refreshToken=');
      expect(cookies).toContain('HttpOnly');
    });

    it('rejects a wrong password with 401', async () => {
      await api().post('/api/v1/auth/register').send(REGISTER_PAYLOAD);
      const res = await api().post('/api/v1/auth/login').send({
        email: REGISTER_PAYLOAD.email,
        username: REGISTER_PAYLOAD.username,
        password: 'wrong-password',
        role: 'employee',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh (token rotation)', () => {
    it('issues new tokens, and reuse of the rotated token revokes the session', async () => {
      const { cookies } = await createAuthedUser('employee');

      // First refresh succeeds and rotates the refresh token
      const first = await api().post('/api/v1/auth/refresh').set('Cookie', cookies);
      expect(first.status).toBe(200);

      // Replaying the OLD (now-revoked) refresh token must be rejected —
      // this is the theft-detection path
      const replay = await api().post('/api/v1/auth/refresh').set('Cookie', cookies);
      expect(replay.status).toBe(401);

      // And because reuse was detected, the NEW token is revoked too
      const newCookies = first.headers['set-cookie'] as unknown as string[];
      const afterTheft = await api().post('/api/v1/auth/refresh').set('Cookie', newCookies);
      expect(afterTheft.status).toBe(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('responds identically for unknown emails (no account enumeration)', async () => {
      const res = await api()
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nobody@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data?.resetToken).toBeUndefined();
    });

    it('never returns the reset token outside development', async () => {
      await api().post('/api/v1/auth/register').send(REGISTER_PAYLOAD);
      const res = await api()
        .post('/api/v1/auth/forgot-password')
        .send({ email: REGISTER_PAYLOAD.email });

      expect(res.status).toBe(200);
      expect(res.body.data?.resetToken).toBeUndefined();
    });
  });

  describe('GET /user/profile', () => {
    it('requires authentication', async () => {
      const res = await api().get('/api/v1/user/profile');
      expect(res.status).toBe(401);
    });

    it('returns the logged-in user profile', async () => {
      const { cookies, creds } = await createAuthedUser('employee');
      const res = await api().get('/api/v1/user/profile').set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(creds.email);
      expect(res.body.data.user.password).toBeUndefined();
    });
  });
});
