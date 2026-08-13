import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── GET: Admin Fetch All Public Facility Feedback & Ratings ──────────────────
export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        action: 'SUBMIT_PUBLIC_FEEDBACK',
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('[get admin feedback error]', error);
    return NextResponse.json({ error: 'Failed to fetch feedback logs' }, { status: 500 });
  }
}
