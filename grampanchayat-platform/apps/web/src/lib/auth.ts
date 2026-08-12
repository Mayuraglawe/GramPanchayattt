import { SignJWT, jwtVerify } from 'jose';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface JWTPayload {
  userId: string;
  mobile: string;
  name: string;
  role: UserRole;
}

// ─── Secret ───────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET ?? 'gp-platform-dev-secret-change-in-prod';
const secret = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'gp_token';

// ─── Role → Dashboard redirect ────────────────────────────────────────────────
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin/dashboard',
  ADMIN: '/admin/dashboard',
  USER: '/user/dashboard',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── Role Access Matrix ───────────────────────────────────────────────────────
// Which roles can access each dashboard level
export const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  '/super-admin': ['SUPER_ADMIN'],
  '/admin':       ['SUPER_ADMIN', 'ADMIN'],
  '/user':        ['SUPER_ADMIN', 'ADMIN', 'USER'],
};
