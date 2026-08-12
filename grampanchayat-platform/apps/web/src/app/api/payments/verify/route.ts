import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, paymentId, razorpayOrderId, razorpayPaymentId, bills } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing required Razorpay parameters for verification' }, { status: 400 });
    }

    const receiptUrl = `/receipts/receipt_${razorpayOrderId}.pdf`;

    // Support Multi-Bill verification
    if (type === 'MULTI' && bills && Array.isArray(bills)) {
      for (const bill of bills) {
        if (bill.id.startsWith('demo-')) continue;

        if (bill.type === 'TAX') {
          // Find the TaxPayment record matching the property and order
          const taxPayment = await prisma.taxPayment.findFirst({
            where: {
              property_id: bill.id,
              razorpay_order_id: razorpayOrderId,
            },
            include: { property: true },
          });

          if (taxPayment) {
            // Update to SUCCESS
            await prisma.taxPayment.update({
              where: { id: taxPayment.id },
              data: {
                payment_status: 'SUCCESS',
                razorpay_payment_id: razorpayPaymentId,
                paid_at: new Date(),
                receipt_url: receiptUrl,
              },
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
          // Find the WaterBill record matching the connection and order
          const waterBill = await prisma.waterBill.findFirst({
            where: {
              id: bill.id,
              razorpay_order_id: razorpayOrderId,
            },
            include: { connection: true },
          });

          if (waterBill) {
            await prisma.waterBill.update({
              where: { id: waterBill.id },
              data: {
                payment_status: 'SUCCESS',
                razorpay_payment_id: razorpayPaymentId,
                paid_at: new Date(),
                receipt_url: receiptUrl,
              },
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

      await prisma.taxPayment.update({
        where: { id: paymentId },
        data: {
          payment_status: 'SUCCESS',
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date(),
          receipt_url: receiptUrl,
        },
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

      await prisma.waterBill.update({
        where: { id: paymentId },
        data: {
          payment_status: 'SUCCESS',
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date(),
          receipt_url: receiptUrl,
        },
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
