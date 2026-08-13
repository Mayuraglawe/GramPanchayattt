import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCertificates, updateCertificateStatus, findUserByMobile, addAuditLog } from '@/lib/db';
import { CertificateType } from '@prisma/client';

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
      return NextResponse.json(certificates);
    }

    if (payload.role === 'ADMIN') {
      const ward = dbUser?.ward_no ?? 0;
      const filtered = certificates.filter((c) => c.ward_no === ward);
      return NextResponse.json(filtered);
    }

    const citizenName = payload.name;
    const filtered = certificates.filter((c) => c.applicantName === citizenName);
    return NextResponse.json(filtered);

  } catch (error) {
    console.error('[get certificates]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: Public Citizen submits certificate application (No Login Required) ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantName, applicantNameMr, applicantMobile, address, type, wardNo, supportingDocs } = body;

    if (!type || !applicantName || !applicantMobile) {
      return NextResponse.json({ error: 'Applicant name, mobile, and certificate type are required' }, { status: 400 });
    }

    let userId: string | undefined = undefined;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const user = await findUserByMobile(payload.mobile);
        userId = user?.id;
      }
    }

    const application = await prisma.certificateApplication.create({
      data: {
        user_id: userId,
        type: type as CertificateType,
        applicant_name: applicantName,
        applicant_name_mr: applicantNameMr || applicantName,
        applicant_mobile: applicantMobile,
        address: address || 'Gram Panchayat Jurisdiction',
        ward_no: wardNo ? Number(wardNo) : 1,
        status: 'PENDING',
        supporting_docs: supportingDocs ? JSON.stringify(supportingDocs) : '[]',
      },
    });

    return NextResponse.json({
      success: true,
      tracking_id: application.tracking_id,
      id: application.id,
      message: 'Certificate application submitted. Save your Tracking ID to check status later.',
    }, { status: 201 });

  } catch (error) {
    console.error('[apply certificate error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: Admin Approve/Reject Certificate Status ───────────────────────────
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
