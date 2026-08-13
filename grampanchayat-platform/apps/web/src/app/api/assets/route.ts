import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetType } from '@prisma/client';

// ── GET: Public asset list & active bookings for public calendar ─────────────
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      where: { is_active: true },
      include: {
        bookings: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            status: true,
          },
        },
      },
    });

    // Seed default assets if empty for a rich initial experience
    if (assets.length === 0) {
      const defaultAssets = [
        {
          name: 'Gram Panchayat Community Hall',
          name_mr: 'ग्रामपंचायत समाज मंदिर हॉल',
          type: AssetType.COMMUNITY_HALL,
          capacity: 350,
          description: 'Spacious hall equipped with stage, lighting, and seating for cultural events and weddings.',
          photo_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
        },
        {
          name: 'Panchayat Agricultural Tractor',
          name_mr: 'ग्रामपंचायत शेती ट्रॅक्टर',
          type: AssetType.TRACTOR,
          capacity: 1,
          description: '50 HP Tractor with rotavator attachment available for local farm tilling.',
          photo_url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
        },
        {
          name: 'Emergency Water Tanker (5000L)',
          name_mr: 'आणीबाणी पाणी टँकर (५००० ली)',
          type: AssetType.WATER_TANKER,
          capacity: 5000,
          description: 'Mobile clean water distribution tanker for weddings, events, or drought relief.',
          photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800',
        },
      ];

      for (const assetData of defaultAssets) {
        await prisma.asset.create({ data: assetData });
      }

      const freshAssets = await prisma.asset.findMany({
        where: { is_active: true },
        include: { bookings: true },
      });
      return NextResponse.json(freshAssets);
    }

    return NextResponse.json(assets);
  } catch (error) {
    console.error('[get assets error]', error);
    return NextResponse.json({ error: 'Failed to load community assets' }, { status: 500 });
  }
}

// ── POST: Public Asset Booking Submission (No Login Required) ────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, bookerName, bookerMobile, startDate, endDate, purpose } = body;

    if (!assetId || !bookerName || !bookerMobile || !startDate || !endDate) {
      return NextResponse.json({ error: 'Asset ID, name, mobile, start date, and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Check overlap with existing approved/pending bookings
    const overlapping = await prisma.assetBooking.findFirst({
      where: {
        asset_id: assetId,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          { start_date: { lte: end }, end_date: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json({
        error: 'Asset is already booked or has a pending request for the selected dates.',
      }, { status: 409 });
    }

    const booking = await prisma.assetBooking.create({
      data: {
        asset_id: assetId,
        booker_name: bookerName,
        booker_mobile: bookerMobile,
        start_date: start,
        end_date: end,
        purpose: purpose || 'Community Event',
        status: 'PENDING',
      },
      include: { asset: true },
    });

    return NextResponse.json({
      success: true,
      tracking_id: booking.tracking_id,
      id: booking.id,
      assetName: booking.asset.name,
      message: 'Asset booking request submitted! Save your Tracking ID to check approval status.',
    }, { status: 201 });

  } catch (error) {
    console.error('[create asset booking error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
