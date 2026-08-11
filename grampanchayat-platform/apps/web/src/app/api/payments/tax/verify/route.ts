import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addAuditLog } from '@/lib/db';

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
    const { paymentId, razorpayPaymentId, success, razorpayOrderId, razorpaySignature } = body;

    if (!paymentId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing paymentId or razorpayPaymentId' }, { status: 400 });
    }

    // Webhook / Callback Signature Verification in Production
    if (process.env.NODE_ENV === 'production') {
      const crypto = await import('crypto');
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
      }
      if (!razorpayOrderId || !razorpaySignature) {
        return NextResponse.json({ error: 'Missing order ID or signature verification tokens' }, { status: 400 });
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
      
      if (expected !== razorpaySignature) {
        return NextResponse.json({ error: 'Payment signature mismatch' }, { status: 400 });
      }
    }

    // 1. Find the payment transaction in the DB
    const taxPayment = await prisma.taxPayment.findUnique({
      where: { id: paymentId },
    });

    if (!taxPayment) {
      return NextResponse.json({ error: 'Payment transaction not found' }, { status: 404 });
    }

    if (success) {
      // 2. Update payment status to SUCCESS
      await prisma.taxPayment.update({
        where: { id: paymentId },
        data: {
          payment_status: 'SUCCESS',
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date(),
          receipt_url: `https://s3.amazonaws.com/gp-receipts/${razorpayPaymentId}.pdf`,
        },
      });

      // 3. Clear property arrears
      await prisma.property.update({
        where: { id: taxPayment.property_id },
        data: {
          arrears: 0,
          last_paid_date: new Date(),
          last_paid_amount: taxPayment.amount,
        },
      });

      // 4. Log to audit trail for financial auditing
      await addAuditLog({
        userId: payload.userId,
        userName: payload.name,
        userRole: payload.role,
        action: 'PROPERTY_TAX_PAYMENT_SUCCESS',
        details: `Tax payment of INR ${taxPayment.amount} confirmed for property ${taxPayment.property_id}. Transaction ID: ${razorpayPaymentId}.`,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({ message: 'Payment verified and property accounts updated.' });
    } else {
      // Mark as FAILED
      await prisma.taxPayment.update({
        where: { id: paymentId },
        data: {
          payment_status: 'FAILED',
        },
      });

      return NextResponse.json({ error: 'Payment transaction failed' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('[payment verify]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
