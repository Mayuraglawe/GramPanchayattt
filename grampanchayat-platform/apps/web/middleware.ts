import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // E.g., 'wandhale.gramportal.in' -> 'wandhale'
  const subdomain = hostname.split('.')[0];
  
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost:3000') {
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
