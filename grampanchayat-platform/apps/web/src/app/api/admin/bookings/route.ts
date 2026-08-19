import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ── GET: Admin fetch all asset bookings with full asset info ──────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bookings = await prisma.assetBooking.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        asset: { select: { name: true, type: true } },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[admin get bookings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Admin Approve / Reject an asset booking ───────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const booking = await prisma.assetBooking.update({
      where: { id },
      data: { status },
      include: { asset: { select: { name: true } } },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: `${status}_ASSET_BOOKING`,
      details: `Asset booking for "${booking.asset.name}" by ${booking.booker_name} marked as ${status}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[admin patch booking]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Admin delete a booking ───────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.assetBooking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin delete booking]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
