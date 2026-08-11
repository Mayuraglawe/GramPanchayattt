import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { saveUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, mobile, pin } = body;

    // 1. Basic validation
    if (!fullName || !mobile || !pin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // 2. Hash the PIN using bcrypt (automatically salts it)
    // The cost factor '10' is standard (determines how slow it is to compute)
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    // 3. Save to database
    // Note: We only save the hashedPin, we DO NOT save the plain text PIN
    const newUser = {
      fullName,
      mobile,
      hashedPin,
      // You can add aadhaar here if provided
      role: 'citizen'
    };

    await saveUser(newUser);

    // 4. Return success (DO NOT return the hash in the response)
    return NextResponse.json(
      { message: 'Registration successful!' },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Handle specific errors like duplicate mobile number
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
