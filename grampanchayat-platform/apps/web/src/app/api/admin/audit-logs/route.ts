import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getAuditLogs } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('[get audit logs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
