// Route prefixes relative to the shared api client's baseURL (/api/v1).
// In production, nginx proxies /api/ to the backend container; in dev,
// the Vite proxy (see vite.config.js) forwards /api to localhost:8000.
export const AUTH_API_END_POINT = "/auth";
export const USER_API_END_POINT = "/user";
export const JOB_API_END_POINT = "/job";
export const APPLICATION_API_END_POINT = "/application";
export const COMPANY_API_END_POINT = "/company";
export const REVIEW_API_END_POINT = "/reviews";
export const USER_SEARCH_API_END_POINT = "/user/workers";
