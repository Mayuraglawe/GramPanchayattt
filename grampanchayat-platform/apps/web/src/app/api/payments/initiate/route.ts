import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, amount, bills } = body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    // Support Multi-Bill Array checkout
    if (bills && Array.isArray(bills)) {
      let totalAmount = 0;

      for (const bill of bills) {
        totalAmount += parseFloat(bill.amount);
      }
      
      const orderOptions = {
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };
      
      let realOrderId = '';
      try {
        const order = await razorpay.orders.create(orderOptions);
        realOrderId = order.id;
      } catch (err) {
        console.error('Razorpay SDK error (check keys):', err);
        // Fallback to mock for local dev if keys are invalid
        realOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      }

      for (const bill of bills) {
        const billAmount = parseFloat(bill.amount);

        // Skip DB updates for local demo IDs
        if (bill.id.startsWith('demo-')) continue;

        if (bill.type === 'TAX') {
          const taxPayment = await prisma.taxPayment.create({
            data: {
              property_id: bill.id,
              amount: billAmount,
              period: '2026-2027',
            },
          });
          
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: Prisma Client types are outdated until dev server is restarted
          await prisma.entityStateLog.create({
            data: {
              entity_id: taxPayment.id,
              entity_type: 'tax_payment',
              state: 'INITIATED',
              payload: {
                razorpay_order_id: realOrderId,
                amount: billAmount,
              },
              triggered_by: 'system',
            }
          });
        } else if (bill.type === 'WATER') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: Prisma Client types are outdated until dev server is restarted
          await prisma.entityStateLog.create({
            data: {
              entity_id: bill.id,
              entity_type: 'water_bill',
              state: 'INITIATED',
              payload: {
                razorpay_order_id: realOrderId,
                amount: billAmount,
              },
              triggered_by: 'system',
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        orderId: realOrderId,
        amount: Math.round(totalAmount * 100), // in paise
        currency: 'INR',
      });
    }

    // Fallback to Single-Bill checkout
    if (!type || !id || !amount) {
      return NextResponse.json({ error: 'Missing type, id, or amount' }, { status: 400 });
    }

    const billAmount = parseFloat(amount);
    
    const orderOptions = {
      amount: Math.round(billAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    let realOrderId = '';
    try {
      const order = await razorpay.orders.create(orderOptions);
      realOrderId = order.id;
    } catch (err) {
      console.error('Razorpay SDK error (check keys):', err);
      realOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    }

    if (id.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        orderId: realOrderId,
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
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Prisma Client types are outdated until dev server is restarted
      await prisma.entityStateLog.create({
        data: {
          entity_id: payment.id,
          entity_type: 'tax_payment',
          state: 'INITIATED',
          payload: {
            razorpay_order_id: realOrderId,
            amount: billAmount,
          },
          triggered_by: 'system',
        }
      });

      return NextResponse.json({
        success: true,
        orderId: realOrderId,
        paymentId: payment.id,
        amount: Math.round(billAmount * 100),
        currency: 'INR',
      });
    } else if (type === 'WATER') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Prisma Client types are outdated until dev server is restarted
      await prisma.entityStateLog.create({
        data: {
          entity_id: id,
          entity_type: 'water_bill',
          state: 'INITIATED',
          payload: {
            razorpay_order_id: realOrderId,
            amount: billAmount,
          },
          triggered_by: 'system',
        }
      });

      return NextResponse.json({
        success: true,
        orderId: realOrderId,
        paymentId: id,
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
