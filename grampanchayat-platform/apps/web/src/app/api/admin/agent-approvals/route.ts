import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET: List all pending agent approval requests ─────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requests = await prisma.agentPermissionRequest.findMany({
      orderBy: { requested_at: 'desc' },
      include: { approvals: true },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('[get agent approvals error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Approve or Reject an agent permission request ─────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, approved, comment } = body;
    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create approval record
    await prisma.agentPermissionApproval.create({
      data: {
        request_id: id,
        approved_by: payload.userId,
        role: payload.role as 'SUPER_ADMIN' | 'ADMIN',
        approved,
        comment: comment || null,
      },
    });

    // Update the main request status
    const updatedRequest = await prisma.agentPermissionRequest.update({
      where: { id },
      data: { status: approved ? 'APPROVED' : 'REJECTED' },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('[approve agent request error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
