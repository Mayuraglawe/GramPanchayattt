import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const body = await request.json();
    const { propertyId, amount } = body;

    if (!propertyId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      // Seed a mock property if not present for development demo
      // This ensures the payments UI page is instantly interactive!
      const user = await prisma.user.findFirst({ where: { id: payload.userId } });
      await prisma.property.create({
        data: {
          id: propertyId,
          owner_user_id: user?.id,
          owner_name: payload.name,
          survey_no: 'SRV-1024-W1',
          ward_no: user?.ward_no ?? 1,
          area_sqft: 1200,
          property_type: 'RESIDENTIAL',
          address: 'Wandhale Ward 1',
          annual_tax_amount: 1500,
          arrears: 1500,
        },
      });
    }

    // 2. Generate simulated Razorpay Order ID
    const razorpayOrderId = 'order_' + Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Create initiated tax payment record in PostgreSQL
    const payment = await prisma.taxPayment.create({
      data: {
        property_id: propertyId,
        amount: Number(amount),
        period: 'FY-2026-27',
        payment_status: 'INITIATED',
        razorpay_order_id: razorpayOrderId,
      },
    });

    return NextResponse.json({
      orderId: razorpayOrderId,
      amount: amount,
      currency: 'INR',
      keyId: 'rzp_test_MOCK_KEY_54321', // Mock key for frontend modal popup
      paymentId: payment.id,
    });
  } catch (error: unknown) {
    console.error('[payment initiate]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
