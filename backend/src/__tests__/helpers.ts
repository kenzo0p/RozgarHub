import request from 'supertest';
import app from '../app.js';

export const api = () => request(app);

let userCounter = 0;

/**
 * Register + login a user, returning auth cookies and the user object.
 * Each call creates a unique user.
 */
export async function createAuthedUser(role: 'employee' | 'employer') {
  userCounter += 1;
  const creds = {
    fullname: `Test User ${userCounter}`,
    username: `testuser${userCounter}`,
    email: `testuser${userCounter}@example.com`,
    password: 'password123',
    phoneNumber: '9876543210',
    role,
  };

  const registerRes = await api().post('/api/v1/auth/register').send(creds);
  if (registerRes.status !== 201) {
    throw new Error(`Test user registration failed: ${JSON.stringify(registerRes.body)}`);
  }

  const loginRes = await api().post('/api/v1/auth/login').send({
    email: creds.email,
    username: creds.username,
    password: creds.password,
    role,
  });
  if (loginRes.status !== 200) {
    throw new Error(`Test user login failed: ${JSON.stringify(loginRes.body)}`);
  }

  const cookies = loginRes.headers['set-cookie'] as unknown as string[];
  return { creds, cookies, user: loginRes.body.data.user };
}

/**
 * Create a company owned by the given employer (cookie-authenticated).
 */
export async function createCompany(cookies: string[], name: string) {
  const res = await api()
    .post('/api/v1/company')
    .set('Cookie', cookies)
    .send({ companyName: name });
  if (res.status !== 201) {
    throw new Error(`Test company creation failed: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.company;
}

/**
 * Post a job for the given company (cookie-authenticated employer).
 */
export async function createJob(cookies: string[], companyId: string, title = 'Backend Engineer') {
  const res = await api()
    .post('/api/v1/job')
    .set('Cookie', cookies)
    .send({
      title,
      description: 'Build and maintain APIs for our job platform.',
      requirements: 'Node.js, MongoDB',
      salary: 12,
      location: 'Pune',
      jobType: 'Full-time',
      position: 2,
      experience: 1,
      companyId,
    });
  return res;
}
