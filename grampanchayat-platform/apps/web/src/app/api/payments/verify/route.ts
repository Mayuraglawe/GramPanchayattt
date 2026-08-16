import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, bills, payerDetails } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing required Razorpay parameters for verification' }, { status: 400 });
    }

    if (razorpaySignature) {
      const crypto = await import('crypto');
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
      }
      const expected = crypto
        .createHmac('sha256', secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
      
      if (expected !== razorpaySignature) {
        return NextResponse.json({ error: 'Payment signature mismatch' }, { status: 400 });
      }
    }

    const receiptUrl = `/receipts/receipt_${razorpayOrderId}.pdf`;

    // Support Multi-Bill verification
    if (type === 'MULTI' && bills && Array.isArray(bills)) {
      for (const bill of bills) {
        if (bill.id.startsWith('demo-')) continue;

        if (bill.type === 'TAX') {
          // Find the TaxPayment record matching the property
          const taxPayment = await prisma.taxPayment.findFirst({
            where: {
              property_id: bill.id,
            },
            orderBy: { created_at: 'desc' },
            include: { property: true },
          });

          if (taxPayment) {
            // Insert SUCCESS state
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Prisma Client types are outdated until dev server is restarted
            await prisma.entityStateLog.create({
              data: {
                entity_id: taxPayment.id,
                entity_type: 'tax_payment',
                state: 'SUCCESS',
                payload: {
                  razorpay_payment_id: razorpayPaymentId,
                  receipt_url: receiptUrl,
                  amount: Number(taxPayment.amount),
                  payer_details: payerDetails,
                },
                triggered_by: 'webhook',
              }
            });

            // Settle Property dues
            const prop = taxPayment.property;
            const paidAmt = Number(taxPayment.amount);

            let newArrears = Number(prop.arrears) - paidAmt;
            let newAnnualTax = Number(prop.annual_tax_amount);

            if (newArrears < 0) {
              newAnnualTax = Math.max(0, newAnnualTax + newArrears);
              newArrears = 0;
            }

            await prisma.property.update({
              where: { id: prop.id },
              data: {
                arrears: newArrears,
                annual_tax_amount: newAnnualTax,
                last_paid_amount: paidAmt,
                last_paid_date: new Date(),
              },
            });

            // Write Audit Log
            await prisma.auditLog.create({
              data: {
                user_id: prop.owner_user_id || '00000000-0000-0000-0000-000000000000',
                action: 'PAYMENT_TAX',
                entity_type: 'TAX_PAYMENT',
                entity_id: taxPayment.id,
                new_value: {
                  amountPaid: paidAmt,
                  surveyNo: prop.survey_no,
                  ownerName: prop.owner_name,
                  razorpayPaymentId,
                },
                ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
              },
            });
          }

        } else if (bill.type === 'WATER') {
          // Find the WaterBill record
          const waterBill = await prisma.waterBill.findFirst({
            where: {
              id: bill.id,
            },
            include: { connection: true },
          });

          if (waterBill) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Prisma Client types are outdated until dev server is restarted
            await prisma.entityStateLog.create({
              data: {
                entity_id: waterBill.id,
                entity_type: 'water_bill',
                state: 'SUCCESS',
                payload: {
                  razorpay_payment_id: razorpayPaymentId,
                  receipt_url: receiptUrl,
                  amount: Number(waterBill.total_amount),
                  payer_details: payerDetails,
                },
                triggered_by: 'webhook',
              }
            });

            // Write Audit Log
            await prisma.auditLog.create({
              data: {
                user_id: waterBill.connection.owner_user_id || '00000000-0000-0000-0000-000000000000',
                action: 'PAYMENT_WATER',
                entity_type: 'WATER_BILL',
                entity_id: waterBill.id,
                new_value: {
                  amountPaid: Number(waterBill.total_amount),
                  connectionNo: waterBill.connection.connection_number,
                  ownerName: waterBill.connection.owner_name,
                  razorpayPaymentId,
                },
                ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
              },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'All selected bills verified successfully',
        receiptUrl,
      });
    }

    // Fallback to Single-Bill verification
    if (!type || !paymentId) {
      return NextResponse.json({ error: 'Missing type or paymentId' }, { status: 400 });
    }

    if (paymentId.startsWith('demo-')) {
      return NextResponse.json({
        success: true,
        message: 'Mock payment verified successfully',
        receiptUrl,
      });
    }

    if (type === 'TAX') {
      const taxPayment = await prisma.taxPayment.findUnique({
        where: { id: paymentId },
        include: { property: true },
      });

      if (!taxPayment) {
        return NextResponse.json({ error: 'Transaction record not found' }, { status: 404 });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Prisma Client types are outdated until dev server is restarted
      await prisma.entityStateLog.create({
        data: {
          entity_id: paymentId,
          entity_type: 'tax_payment',
          state: 'SUCCESS',
          payload: {
            razorpay_payment_id: razorpayPaymentId,
            receipt_url: receiptUrl,
            amount: Number(taxPayment.amount),
            payer_details: payerDetails,
          },
          triggered_by: 'webhook',
        }
      });

      const prop = taxPayment.property;
      const paidAmt = Number(taxPayment.amount);

      let newArrears = Number(prop.arrears) - paidAmt;
      let newAnnualTax = Number(prop.annual_tax_amount);

      if (newArrears < 0) {
        newAnnualTax = Math.max(0, newAnnualTax + newArrears);
        newArrears = 0;
      }

      await prisma.property.update({
        where: { id: prop.id },
        data: {
          arrears: newArrears,
          annual_tax_amount: newAnnualTax,
          last_paid_amount: paidAmt,
          last_paid_date: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          user_id: prop.owner_user_id || '00000000-0000-0000-0000-000000000000',
          action: 'PAYMENT_TAX',
          entity_type: 'TAX_PAYMENT',
          entity_id: paymentId,
          new_value: {
            amountPaid: paidAmt,
            surveyNo: prop.survey_no,
            ownerName: prop.owner_name,
            razorpayPaymentId,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Property tax payment verified successfully',
        receiptUrl,
      });

    } else if (type === 'WATER') {
      const waterBill = await prisma.waterBill.findUnique({
        where: { id: paymentId },
        include: { connection: true },
      });

      if (!waterBill) {
        return NextResponse.json({ error: 'Water bill record not found' }, { status: 404 });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Prisma Client types are outdated until dev server is restarted
      await prisma.entityStateLog.create({
        data: {
          entity_id: paymentId,
          entity_type: 'water_bill',
          state: 'SUCCESS',
          payload: {
            razorpay_payment_id: razorpayPaymentId,
            receipt_url: receiptUrl,
            amount: Number(waterBill.total_amount),
            payer_details: payerDetails,
          },
          triggered_by: 'webhook',
        }
      });

      await prisma.auditLog.create({
        data: {
          user_id: waterBill.connection.owner_user_id || '00000000-0000-0000-0000-000000000000',
          action: 'PAYMENT_WATER',
          entity_type: 'WATER_BILL',
          entity_id: paymentId,
          new_value: {
            amountPaid: Number(waterBill.total_amount),
            connectionNo: waterBill.connection.connection_number,
            ownerName: waterBill.connection.owner_name,
            razorpayPaymentId,
          },
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Water bill payment verified successfully',
        receiptUrl,
      });
    }

    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });

  } catch (error) {
    console.error('[payment verify API error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
