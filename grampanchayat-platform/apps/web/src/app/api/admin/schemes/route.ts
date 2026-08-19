import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ── POST: Create a new scheme ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      scheme_code,
      name,
      name_mr,
      description,
      description_mr,
      government_level,
      ministry,
      eligibility,
      benefits,
      benefits_mr,
      application_url,
      helpline,
    } = body;

    if (!scheme_code || !name || !name_mr || !description || !description_mr || !benefits || !benefits_mr) {
      return NextResponse.json({ error: 'Missing required schema fields' }, { status: 400 });
    }

    const newScheme = await prisma.scheme.create({
      data: {
        scheme_code,
        name,
        name_mr,
        description,
        description_mr,
        government_level: government_level || 'CENTRAL',
        ministry: ministry || null,
        eligibility: eligibility || {},
        benefits,
        benefits_mr,
        application_url: application_url || null,
        helpline: helpline || null,
        is_active: true,
      },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'CREATE_SCHEME',
      details: `Created new government scheme: ${name} (${scheme_code}).`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(newScheme, { status: 201 });
  } catch (error: unknown) {
    console.error('[create scheme API error]:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'A scheme with this unique code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update an existing scheme ─────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Missing scheme id' }, { status: 400 });

    const updated = await prisma.scheme.update({
      where: { id },
      data: updateData,
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'UPDATE_SCHEME',
      details: `Updated scheme: ${updated.name} (${updated.scheme_code}).`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[update scheme error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Soft-delete (deactivate) or hard-delete a scheme ─────────────────
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing scheme id' }, { status: 400 });

    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });

    await prisma.scheme.delete({ where: { id } });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'DELETE_SCHEME',
      details: `Deleted scheme: ${scheme.name} (${scheme.scheme_code}).`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete scheme error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
