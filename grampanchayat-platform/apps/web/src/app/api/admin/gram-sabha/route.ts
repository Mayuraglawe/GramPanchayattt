import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ── GET: List all Gram Sabha meetings ────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meetings = await prisma.gramSabha.findMany({
      where: { is_deleted: false },
      orderBy: { meeting_date: 'desc' },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('[get gram sabha error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Schedule a new Gram Sabha meeting ───────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { meeting_date, meeting_type, venue, agenda } = body;

    if (!meeting_date) {
      return NextResponse.json({ error: 'Meeting date is required' }, { status: 400 });
    }

    const meeting = await prisma.gramSabha.create({
      data: {
        meeting_date: new Date(meeting_date),
        meeting_type: meeting_type || 'REGULAR',
        venue: venue || null,
        agenda: agenda || [],
        created_by: payload.userId,
      },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'CREATE_GRAM_SABHA',
      details: `Scheduled Gram Sabha meeting on ${new Date(meeting_date).toLocaleDateString()}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('[create gram sabha error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update meeting minutes/results ─────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, attendees_count, quorum_met, decisions, minutes_url } = body;
    if (!id) return NextResponse.json({ error: 'Missing meeting id' }, { status: 400 });

    const meeting = await prisma.gramSabha.update({
      where: { id },
      data: {
        attendees_count: attendees_count ?? undefined,
        quorum_met: quorum_met ?? undefined,
        decisions: decisions ?? undefined,
        minutes_url: minutes_url ?? undefined,
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('[update gram sabha error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Soft-delete a meeting record ──────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing meeting id' }, { status: 400 });

    await prisma.gramSabha.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete gram sabha error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
