import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { findUserByMobile } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const dbUser = await findUserByMobile(payload.mobile);

  return NextResponse.json({
    userId: payload.userId,
    name: payload.name,
    mobile: payload.mobile,
    role: payload.role,
    ward_no: dbUser?.ward_no ?? null,
  });
}
