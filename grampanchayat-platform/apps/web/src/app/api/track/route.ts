import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const mobile = searchParams.get('mobile');
  const id = searchParams.get('id');

  if (!type || !mobile || !id) {
    return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
  }

  try {
    if (type === 'COMPLAINT') {
      const complaint = await prisma.complaint.findFirst({
        where: {
          tracking_id: id,
          filer_mobile: mobile,
        },
      });

      if (!complaint) {
        return NextResponse.json({ success: false, message: 'No complaint found for this Tracking ID & Mobile.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'COMPLAINT',
          status: complaint.status,
          details: complaint.description.substring(0, 80) + '...',
          appliedAt: complaint.created_at,
        },
      });
    }

    if (type === 'CERTIFICATE') {
      const cert = await prisma.certificateApplication.findFirst({
        where: {
          tracking_id: id,
          applicant_mobile: mobile,
        },
      });

      if (!cert) {
        return NextResponse.json({ success: false, message: 'No certificate application found for this Tracking ID & Mobile.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'CERTIFICATE',
          status: cert.status,
          details: `${cert.type} Certificate for ${cert.applicant_name}`,
          appliedAt: cert.created_at,
        },
      });
    }

    if (type === 'ASSET_BOOKING' || type === 'ASSET') {
      const booking = await prisma.assetBooking.findFirst({
        where: {
          tracking_id: id,
          booker_mobile: mobile,
        },
        include: { asset: true },
      });

      if (!booking) {
        return NextResponse.json({ success: false, message: 'No asset booking reservation found for this Tracking ID & Mobile.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'ASSET_BOOKING',
          status: booking.status,
          details: `Booking for ${booking.asset.name} (${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()})`,
          appliedAt: booking.created_at,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid tracking type' }, { status: 400 });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
