import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication & Role
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // 2. Parse request body
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

    // Validate required fields
    if (!scheme_code || !name || !name_mr || !description || !description_mr || !benefits || !benefits_mr) {
      return NextResponse.json({ error: 'Missing required schema fields' }, { status: 400 });
    }

    // 3. Write Scheme to DB
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

    // 4. Write to Audit Log
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
