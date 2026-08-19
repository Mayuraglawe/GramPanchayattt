import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── POST: Add a progress update to a project ─────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { note, note_mr, progress_pct, photo_url } = body;

    if (!note || progress_pct === undefined) {
      return NextResponse.json({ error: 'Note and progress percentage are required' }, { status: 400 });
    }

    if (progress_pct < 0 || progress_pct > 100) {
      return NextResponse.json({ error: 'Progress must be 0–100' }, { status: 400 });
    }

    const update = await prisma.projectProgressUpdate.create({
      data: {
        project_id: params.id,
        note,
        note_mr: note_mr || null,
        progress_pct: parseInt(progress_pct),
        photos: photo_url ? [photo_url] : [],
        updated_by: payload.userId,
      },
    });

    // Also update the project's status automatically based on progress
    if (progress_pct >= 100) {
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'COMPLETED', actual_end_date: new Date() },
      });
    } else if (progress_pct > 0) {
      await prisma.project.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error('[add project update error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET: List all updates for a project ──────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await prisma.projectProgressUpdate.findMany({
      where: { project_id: params.id },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error('[get project updates error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
