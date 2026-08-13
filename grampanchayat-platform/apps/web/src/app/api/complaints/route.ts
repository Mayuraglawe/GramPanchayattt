import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getComplaints, updateComplaintStatus, findUserByMobile, addAuditLog } from '@/lib/db';

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
      return NextResponse.json(complaints);
    }

    if (payload.role === 'ADMIN') {
      const ward = dbUser?.ward_no ?? 0;
      const filtered = complaints.filter((c) => c.ward_no === ward);
      return NextResponse.json(filtered);
    }

    const citizenName = payload.name;
    const filtered = complaints.filter((c) => c.filerName === citizenName);
    return NextResponse.json(filtered);

  } catch (error) {
    console.error('[get complaints]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Public Citizen submits complaint (No Login Required) ────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filerName, filerMobile, category, description, wardNo, photoUrls, latitude, longitude } = body;

    if (!category || !description || !filerMobile) {
      return NextResponse.json({ error: 'Filer mobile, category, and description are required' }, { status: 400 });
    }

    // Optional user token binding if citizen happens to be logged in
    let userId: string | undefined = undefined;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const user = await findUserByMobile(payload.mobile);
        userId = user?.id;
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        user_id: userId,
        filer_name: filerName || 'Gram Villager',
        filer_mobile: filerMobile,
        category,
        description,
        ward_no: wardNo ? Number(wardNo) : 1,
        status: 'OPEN',
        geo_lat: latitude ? Number(latitude) : null,
        geo_lng: longitude ? Number(longitude) : null,
        photo_urls: photoUrls ? JSON.stringify(photoUrls) : '[]',
      },
    });

    return NextResponse.json({
      success: true,
      tracking_id: complaint.tracking_id,
      id: complaint.id,
      message: 'Grievance submitted successfully. Save your Tracking ID to monitor progress.',
    }, { status: 201 });

  } catch (error) {
    console.error('[file complaint error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Admin Update Complaint Status ─────────────────────────────────────
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
