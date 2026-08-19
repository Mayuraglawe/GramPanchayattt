import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';
import { NoticeType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ── GET: Fetch all notices ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notices = await prisma.notice.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error('[admin get notices]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Create a new notice ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, title_mr, body: content, body_mr, type, expires_at, is_published } = body;

    if (!title || !title_mr || !content || !body_mr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        title_mr,
        body: content,
        body_mr,
        type: type as NoticeType || NoticeType.GENERAL,
        is_published: is_published ?? true,
        published_at: is_published ? new Date() : null,
        expires_at: expires_at ? new Date(expires_at) : null,
        created_by: payload.userId,
      },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'CREATE_NOTICE',
      details: `Created new notice: ${title}`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error('[create notice error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update notice status ──────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, is_published } = body;

    if (!id || typeof is_published !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: { 
        is_published,
        published_at: is_published ? new Date() : null,
      },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'UPDATE_NOTICE',
      details: `Updated notice status for: ${notice.title} to ${is_published ? 'published' : 'unpublished'}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, notice });
  } catch (error) {
    console.error('[update notice error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Remove a notice ──────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing notice id' }, { status: 400 });

    const notice = await prisma.notice.delete({ where: { id } });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'DELETE_NOTICE',
      details: `Deleted notice: ${notice.title}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete notice error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
