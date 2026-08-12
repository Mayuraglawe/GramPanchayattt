import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, amount, bills } = body;

    const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;

    // Support Multi-Bill Array checkout
    if (bills && Array.isArray(bills)) {
      let totalAmount = 0;

      for (const bill of bills) {
        const billAmount = parseFloat(bill.amount);
        totalAmount += billAmount;

        // Skip DB updates for local demo IDs
        if (bill.id.startsWith('demo-')) continue;

        if (bill.type === 'TAX') {
          await prisma.taxPayment.create({
            data: {
              property_id: bill.id,
              amount: billAmount,
              period: '2026-2027',
              payment_status: 'INITIATED',
              razorpay_order_id: mockOrderId,
            },
          });
        } else if (bill.type === 'WATER') {
          await prisma.waterBill.update({
            where: { id: bill.id },
            data: {
              payment_status: 'INITIATED',
              razorpay_order_id: mockOrderId,
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
      });
    }

    // Fallback to Single-Bill checkout
    if (!type || !id || !amount) {
      return NextResponse.json({ error: 'Missing type, id, or amount' }, { status: 400 });
    }

    const billAmount = parseFloat(amount);

    if (id.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(billAmount * 100),
        currency: 'INR',
      });
    }

    if (type === 'TAX') {
      const payment = await prisma.taxPayment.create({
        data: {
          property_id: id,
          amount: billAmount,
          period: '2026-2027',
          payment_status: 'INITIATED',
          razorpay_order_id: mockOrderId,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        paymentId: payment.id,
        amount: Math.round(billAmount * 100),
        currency: 'INR',
      });
    } else if (type === 'WATER') {
      const bill = await prisma.waterBill.update({
        where: { id: id },
        data: {
          payment_status: 'INITIATED',
          razorpay_order_id: mockOrderId,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        paymentId: bill.id,
        amount: Math.round(billAmount * 100),
        currency: 'INR',
      });
    }

    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });

  } catch (error) {
    console.error('[payment initiate API error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
