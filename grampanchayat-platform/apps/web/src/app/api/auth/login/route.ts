import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByMobile } from '@/lib/db';
import { signToken, COOKIE_NAME, ROLE_DASHBOARD } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, pin } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!mobile || !pin) {
      return NextResponse.json(
        { error: 'Mobile and PIN are required' },
        { status: 400 }
      );
    }

    // ── Find user ─────────────────────────────────────────────────────────────
    const user = await findUserByMobile(mobile);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid mobile number or PIN' },
        { status: 401 }
      );
    }

    // ── Verify PIN ────────────────────────────────────────────────────────────
    const isValid = await bcrypt.compare(pin, user.hashedPin);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid mobile number or PIN' },
        { status: 401 }
      );
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────────
    const token = await signToken({
      userId: user.id,
      mobile: user.mobile,
      name: user.fullName,
      role: user.role,
    });

    // ── Set httpOnly cookie ───────────────────────────────────────────────────
    const response = NextResponse.json({
      message: 'Login successful',
      redirectTo: ROLE_DASHBOARD[user.role],
      user: {
        name: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
