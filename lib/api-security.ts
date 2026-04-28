const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://marcuspff.com',
  'https://www.marcuspff.com',
]);

/**
 * Returns true if the request originates from an allowed browser origin
 * (or no Origin header is present, which means it's a non-browser request
 * such as a server-side fetch or curl test). The strict CSRF protection
 * comes from rejecting browser requests that have an Origin not in the
 * allowlist — Origin is set by browsers and cannot be forged from JS.
 */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  return ALLOWED_ORIGINS.has(origin);
}
