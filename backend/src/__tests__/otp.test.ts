import { describe, it, expect } from 'vitest';
import { api } from './helpers.js';

async function requestOtp(phoneNumber: string) {
  const res = await api().post('/api/v1/auth/otp/request').send({ phoneNumber });
  return res;
}

describe('Phone OTP auth', () => {
  it('requests an OTP and reports the number is new', async () => {
    const res = await requestOtp('9876500001');
    expect(res.status).toBe(200);
    expect(res.body.data.isNewUser).toBe(true);
    // Dev mode returns the code for testing
    expect(res.body.data.devOtp).toMatch(/^\d{6}$/);
  });

  it('rejects an invalid phone number', async () => {
    const res = await requestOtp('12345');
    expect(res.status).toBe(400);
  });

  it('creates a phone-only account on first verify (needs name + role)', async () => {
    const reqRes = await requestOtp('9876500002');
    const otp = reqRes.body.data.devOtp;

    // Missing name/role for a new number → validation error
    const missing = await api()
      .post('/api/v1/auth/otp/verify')
      .send({ phoneNumber: '9876500002', otp });
    expect(missing.status).toBe(400);

    // With name + role → account created, cookies set
    const created = await api()
      .post('/api/v1/auth/otp/verify')
      .send({ phoneNumber: '9876500002', otp, fullname: 'Ravi Kumar', role: 'employee' });

    expect(created.status).toBe(201);
    expect(created.body.data.isNewUser).toBe(true);
    expect(created.body.data.user.fullname).toBe('Ravi Kumar');
    expect(created.body.data.user.password).toBeUndefined();
    const cookies = (created.headers['set-cookie'] as unknown as string[]).join(';');
    expect(cookies).toContain('accessToken=');
  });

  it('logs an existing phone user in on subsequent verify (no name needed)', async () => {
    // Create the account first
    const first = await requestOtp('9876500003');
    await api().post('/api/v1/auth/otp/verify').send({
      phoneNumber: '9876500003',
      otp: first.body.data.devOtp,
      fullname: 'Sita Devi',
      role: 'employee',
    });

    // Now the number is known
    const second = await requestOtp('9876500003');
    expect(second.body.data.isNewUser).toBe(false);

    const login = await api().post('/api/v1/auth/otp/verify').send({
      phoneNumber: '9876500003',
      otp: second.body.data.devOtp,
    });
    expect(login.status).toBe(200);
    expect(login.body.data.isNewUser).toBe(false);
    expect(login.body.data.user.fullname).toBe('Sita Devi');
  });

  it('rejects a wrong OTP', async () => {
    await requestOtp('9876500004');
    const res = await api()
      .post('/api/v1/auth/otp/verify')
      .send({ phoneNumber: '9876500004', otp: '000000', fullname: 'Test Name', role: 'employee' });
    expect(res.status).toBe(401);
  });

  it('rejects verify when no OTP was requested', async () => {
    const res = await api()
      .post('/api/v1/auth/otp/verify')
      .send({ phoneNumber: '9876509999', otp: '123456', fullname: 'Test Name', role: 'employee' });
    expect(res.status).toBe(401);
  });
});
