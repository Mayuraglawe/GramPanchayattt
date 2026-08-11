import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getSettings, saveSettings, addAuditLog } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[get settings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    await saveSettings(body);

    // Add audit log record for security audit
    await addAuditLog({
      userId: payload.userId,
      userName: payload.name,
      userRole: payload.role,
      action: 'UPDATE_SETTINGS',
      details: `SMS Provider updated to ${body.smsProvider}. Aadhaar Verification is ${body.enableAadhaarVerification ? 'Enabled' : 'Disabled'}. DSC Signing is ${body.enableDscSigning ? 'Enabled' : 'Disabled'}.`,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[save settings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
