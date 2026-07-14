import { Request, Response, NextFunction } from 'express';

/**
 * NoSQL-injection sanitizer — dependency-free.
 *
 * MongoDB query operators are `$`-prefixed keys (`$ne`, `$gt`, `$where`), and
 * dotted keys (`profile.role`) can reach nested paths. If an attacker slips
 * such keys into a JSON body or query string, a query built from that object
 * can be subverted (e.g. `{ password: { $ne: null } }` to bypass a check).
 *
 * We validate most inputs with Zod, but this is defense-in-depth: strip any
 * `$`-prefixed or dotted keys from request data before controllers see it.
 */
function stripDangerousKeys(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(stripDangerousKeys);
    return;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete (value as Record<string, unknown>)[key];
      } else {
        stripDangerousKeys((value as Record<string, unknown>)[key]);
      }
    }
  }
}

export const mongoSanitize = (req: Request, _res: Response, next: NextFunction): void => {
  // req.query is a plain, mutable object on Express 4.
  if (req.body) stripDangerousKeys(req.body);
  if (req.query) stripDangerousKeys(req.query);
  if (req.params) stripDangerousKeys(req.params);
  next();
};
