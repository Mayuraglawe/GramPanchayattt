import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { saveUser } from '@/lib/db';
import type { UserRole } from '@/lib/auth';

// ─── Role assignment ───────────────────────────────────────────────────────────
// Default: USER (Citizen).
// SUPER_ADMIN and ADMIN are only assigned by an existing SUPER_ADMIN
// through the admin panel — never via self-registration.
const ALLOWED_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'USER'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, mobile, pin, role, aadhaar } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!fullName || !mobile || !pin) {
      return NextResponse.json(
        { error: 'fullName, mobile and pin are required' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'Mobile must be a 10-digit number' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    if (aadhaar && !/^\d{4}$/.test(aadhaar)) {
      return NextResponse.json(
        { error: 'Aadhaar must be exactly the last 4 digits' },
        { status: 400 }
      );
    }

    // ── Role guard ────────────────────────────────────────────────────────────
    // Public registration always creates a USER.
    // Higher roles are set only via admin panel (not here).
    const assignedRole: UserRole =
      role && ALLOWED_ROLES.includes(role) && role === 'USER' ? 'USER' : 'USER';

    // ── Hash PIN ──────────────────────────────────────────────────────────────
    const hashedPin = await bcrypt.hash(pin, 10);

    // ── Save ──────────────────────────────────────────────────────────────────
    await saveUser({ fullName, mobile, hashedPin, role: assignedRole, aadhaar });

    return NextResponse.json(
      { message: 'Registration successful! Please log in.' },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('[register]', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';

    if (msg.includes('already exists')) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
