import { describe, it, expect } from 'vitest';
import type { Request, Response } from 'express';
import { mongoSanitize } from '../middlewares/sanitize.middleware.js';
import { captureException } from '../utils/monitoring.js';
import { api } from './helpers.js';

describe('NoSQL sanitizer middleware', () => {
  it('strips $-prefixed and dotted keys from body, query, and params', () => {
    const req = {
      body: { username: 'alice', password: { $ne: null }, 'a.b': 1 },
      query: { q: 'x', $where: '1==1' },
      params: { id: '123', $gt: '' },
    } as unknown as Request;

    let called = false;
    mongoSanitize(req, {} as Response, () => {
      called = true;
    });

    expect(called).toBe(true);
    // The $ne operator key is stripped, neutralizing it; password is left an
    // empty object (harmless), not authenticated against.
    expect(req.body).toEqual({ username: 'alice', password: {} });
    expect(req.query).toEqual({ q: 'x' });
    expect(req.params).toEqual({ id: '123' });
  });

  it('recurses into nested objects and arrays', () => {
    const req = {
      body: { filters: [{ ok: 1, $ne: 2 }], nested: { keep: 1, $or: [] } },
    } as unknown as Request;

    mongoSanitize(req, {} as Response, () => {});

    expect(req.body).toEqual({ filters: [{ ok: 1 }], nested: { keep: 1 } });
  });

  it('neutralizes operator-injection at the login endpoint', async () => {
    // Classic NoSQL auth-bypass payload — must never authenticate.
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ username: { $ne: '' }, password: { $ne: '' }, email: 'x@y.z' });

    expect(res.status).not.toBe(200);
    expect([400, 401]).toContain(res.status);
  });
});

describe('Error monitoring hook', () => {
  it('captures Error and non-Error values without throwing', () => {
    expect(() => captureException(new Error('boom'), { url: '/x' })).not.toThrow();
    expect(() => captureException('a string failure')).not.toThrow();
  });
});
