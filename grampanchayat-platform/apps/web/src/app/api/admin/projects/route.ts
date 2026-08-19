import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ── GET: List all projects ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const projects = await prisma.project.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        progress_updates: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('[admin get projects]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Create a new project ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, name_mr, description, description_mr, category,
      budget_allocated, contractor_name, contractor_phone,
      start_date, end_date, ward_no, tender_number, scheme_name,
    } = body;

    if (!name || !name_mr || !category || !budget_allocated || !start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        name_mr,
        description: description || null,
        description_mr: description_mr || null,
        category,
        budget_allocated: parseFloat(budget_allocated),
        contractor_name: contractor_name || null,
        contractor_phone: contractor_phone || null,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        ward_no: ward_no ? parseInt(ward_no) : null,
        tender_number: tender_number || null,
        scheme_name: scheme_name || null,
        status: ProjectStatus.PLANNED,
        created_by: payload.userId,
      },
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'CREATE_PROJECT',
      details: `Created new project: ${name} (Budget: ₹${budget_allocated})`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('[create project error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update project status ─────────────────────────────────────────────
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
    if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.status === 'COMPLETED' && { actual_end_date: new Date() }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[update project error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: Delete a project ─────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete project error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
