import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── POST: Public Multi-Stakeholder Feedback & Facility Rating ──────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityName, rating, comments, citizenMobile, wardNo } = body;

    if (!facilityName || !rating) {
      return NextResponse.json({ error: 'Facility name and rating (1-5) are required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Save as audit/feedback log entry in DB
    const log = await prisma.auditLog.create({
      data: {
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous citizen sentinel UUID
        action: 'SUBMIT_PUBLIC_FEEDBACK',
        entity_type: 'PUBLIC_FACILITY',
        entity_id: facilityName,
        new_value: {
          rating: numericRating,
          comments: comments || 'No comment provided',
          mobile: citizenMobile || 'Anonymous',
          ward_no: wardNo ? Number(wardNo) : 1,
          submitted_at: new Date().toISOString(),
        },
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      id: log.id,
      message: 'Thank you for your valuable feedback! Your rating helps improve Gram Panchayat services.',
    }, { status: 201 });

  } catch (error) {
    console.error('[submit feedback error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
