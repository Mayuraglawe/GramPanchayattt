import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getComplaints, saveComplaint, updateComplaintStatus, findUserByMobile, addAuditLog } from '@/lib/db';

// ── GET: Fetch complaints based on roles & ward scoping ──────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const dbUser = await findUserByMobile(payload.mobile);
    const complaints = await getComplaints();

    if (payload.role === 'SUPER_ADMIN') {
      // Super Admin sees all
      return NextResponse.json(complaints);
    }

    if (payload.role === 'ADMIN') {
      // Admin sees only tasks from their ward
      const ward = dbUser?.ward_no ?? 0;
      const filtered = complaints.filter((c) => c.ward_no === ward);
      return NextResponse.json(filtered);
    }

    // Citizen (USER) sees only their own complaints
    const citizenName = payload.name;
    const filtered = complaints.filter((c) => c.filerName === citizenName);
    return NextResponse.json(filtered);

  } catch (error) {
    console.error('[get complaints]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Citizen submits complaint ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const dbUser = await findUserByMobile(payload.mobile);
    const body = await request.json();
    const { category, description } = body;

    if (!category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newComplaint = await saveComplaint({
      filerName: payload.name,
      category,
      description,
      ward_no: dbUser?.ward_no ?? 1,
      status: 'OPEN',
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'FILE_COMPLAINT',
      details: `Filed a complaint in category ${category}. Reference ID: ${newComplaint.id}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(newComplaint, { status: 201 });

  } catch (error) {
    console.error('[file complaint]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Update Complaint Status ───────────────────────────────────────────
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

    const dbUser = await findUserByMobile(payload.mobile);
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const complaints = await getComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Ward scoping check for ADMIN
    if (payload.role === 'ADMIN' && complaint.ward_no !== dbUser?.ward_no) {
      return NextResponse.json({ error: 'Access denied: not in your ward' }, { status: 403 });
    }

    await updateComplaintStatus(id, status);

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: `RESOLVE_COMPLAINT`,
      details: `Complaint ${id} status updated to ${status} by ${payload.name}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ message: `Complaint status updated to ${status}` });

  } catch (error) {
    console.error('[update complaint status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
