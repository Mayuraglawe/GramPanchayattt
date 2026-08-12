import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME, ROLE_DASHBOARD, ROUTE_ROLE_MAP } from '@/lib/auth';

// ─── Routes that don't need auth ──────────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register', '/payments', '/schemes', '/api/db-seed'];

// ─── Helper: does a path start with any protected prefix ─────────────────────
function getProtectedPrefix(pathname: string): string | null {
  for (const prefix of Object.keys(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) return prefix;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Allow public routes & static assets ───────────────────────────────────
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/api/payments') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── Not logged in → redirect to login ─────────────────────────────────────
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);

  // ── Invalid / expired token → clear cookie + redirect ─────────────────────
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // ── If visiting /login or /register while logged in → go to dashboard ──────
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[payload.role], request.url));
  }

  // ── Protected route access check ──────────────────────────────────────────
  const prefix = getProtectedPrefix(pathname);
  if (prefix) {
    const allowedRoles = ROUTE_ROLE_MAP[prefix];
    if (!allowedRoles.includes(payload.role)) {
      // Redirect to the user's own dashboard, not a 403
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[payload.role], request.url));
    }
  }

  // ── Attach role info to request headers for server components ─────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-name', payload.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
