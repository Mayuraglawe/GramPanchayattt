import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getCertificates, saveCertificate, updateCertificateStatus, findUserByMobile, addAuditLog } from '@/lib/db';

// ── GET: Fetch certificates based on roles & ward scoping ────────────────────
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
    const certificates = await getCertificates();

    if (payload.role === 'SUPER_ADMIN') {
      // Super Admin sees all
      return NextResponse.json(certificates);
    }

    if (payload.role === 'ADMIN') {
      // Admin sees only tasks from their ward
      const ward = dbUser?.ward_no ?? 0;
      const filtered = certificates.filter((c) => c.ward_no === ward);
      return NextResponse.json(filtered);
    }

    // Citizen (USER) sees only their own certificates
    const citizenName = payload.name;
    const filtered = certificates.filter((c) => c.applicantName === citizenName);
    return NextResponse.json(filtered);

  } catch (error) {
    console.error('[get certificates]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Citizen submits certificate request ────────────────────────────────
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
    const { type, applicantNameMr } = body;

    if (!type || !applicantNameMr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCert = await saveCertificate({
      applicantName: payload.name,
      applicantNameMr,
      type,
      status: 'PENDING',
      ward_no: dbUser?.ward_no ?? 1,
    });

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'APPLY_CERTIFICATE',
      details: `Applied for ${type} certificate. Reference ID: ${newCert.id}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json(newCert, { status: 201 });

  } catch (error) {
    console.error('[apply certificate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Approve/Reject / Update Status ────────────────────────────────────
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

    const certs = await getCertificates();
    const cert = certs.find((c) => c.id === id);
    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Ward scoping check for ADMIN
    if (payload.role === 'ADMIN' && cert.ward_no !== dbUser?.ward_no) {
      return NextResponse.json({ error: 'Access denied: not in your ward' }, { status: 403 });
    }

    await updateCertificateStatus(id, status, payload.name);

    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: `${status}_CERTIFICATE`,
      details: `Certificate application ${id} has been marked ${status} by ${payload.name}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ message: `Certificate application status updated to ${status}` });

  } catch (error) {
    console.error('[update certificate status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
