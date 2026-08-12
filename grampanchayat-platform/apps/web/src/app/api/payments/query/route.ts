import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const bills = [];
    const isMobile = /^\d{10}$/.test(query);

    if (isMobile) {
      // 1. Search for user by mobile
      const user = await prisma.user.findUnique({
        where: { mobile: query },
      });

      if (user) {
        // Query user's Property Tax (Ghar Bill) records
        const properties = await prisma.property.findMany({
          where: { owner_user_id: user.id },
        });

        for (const prop of properties) {
          const totalDues = Number(prop.annual_tax_amount) + Number(prop.arrears);
          if (totalDues > 0) {
            bills.push({
              id: prop.id,
              type: 'TAX',
              title: 'Property Tax (घरपट्टी / मालमत्ता कर)',
              consumerId: prop.survey_no,
              ownerName: prop.owner_name,
              amount: totalDues,
              details: `Survey No: ${prop.survey_no} | Area: ${prop.area_sqft} sqft | Type: ${prop.property_type}`,
              status: 'UNPAID',
            });
          }
        }

        // Query user's Water Connection bills
        const waterConnections = await prisma.waterConnection.findMany({
          where: { owner_user_id: user.id },
        });

        for (const conn of waterConnections) {
          // Find the latest initiated or unpaid water bill
          let bill = await prisma.waterBill.findFirst({
            where: {
              connection_id: conn.id,
              payment_status: { not: 'SUCCESS' },
            },
            orderBy: { created_at: 'desc' },
          });

          // Create a mock unpaid bill if none exists for this connection
          if (!bill) {
            bill = await prisma.waterBill.create({
              data: {
                connection_id: conn.id,
                billing_month: 'August 2026',
                amount_due: conn.monthly_rate,
                total_amount: conn.monthly_rate,
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                payment_status: 'INITIATED',
              },
            });
          }

          if (Number(bill.total_amount) > 0) {
            bills.push({
              id: bill.id,
              type: 'WATER',
              title: 'Water Bill (पाणी पट्टी)',
              consumerId: conn.connection_number,
              ownerName: conn.owner_name,
              amount: Number(bill.total_amount),
              details: `Connection No: ${conn.connection_number} | Type: ${conn.connection_type} | Month: ${bill.billing_month}`,
              status: 'UNPAID',
            });
          }
        }
      }

      // 2. Fallback Mock Data for demo user if no DB records found
      if (bills.length === 0 && query === '9876543213') {
        return NextResponse.json({
          citizenName: 'Ram Pawar (राम पवार)',
          mobile: '9876543213',
          ward: 1,
          bills: [
            {
              id: 'demo-tax-id-101',
              type: 'TAX',
              title: 'Property Tax (घरपट्टी / मालमत्ता कर)',
              consumerId: '101',
              ownerName: 'Ram Pawar',
              amount: 2450.00,
              details: 'Survey No: 101 | Area: 1280 sqft | Type: RESIDENTIAL',
              status: 'UNPAID',
            },
            {
              id: 'demo-water-id-501',
              type: 'WATER',
              title: 'Water Bill (पाणी पट्टी)',
              consumerId: 'WC-501',
              ownerName: 'Ram Pawar',
              amount: 350.00,
              details: 'Connection No: WC-501 | Type: DOMESTIC | Month: August 2026',
              status: 'UNPAID',
            }
          ]
        });
      }

      if (bills.length === 0) {
        return NextResponse.json({ error: 'No active bills found for this mobile number' }, { status: 404 });
      }

      return NextResponse.json({
        citizenName: user?.name || 'Citizen',
        mobile: query,
        ward: user?.ward_no || 1,
        bills,
      });

    } else {
      // Query single bill by Consumer ID / Survey No
      // 1. Check Property Tax
      const property = await prisma.property.findFirst({
        where: { survey_no: query },
      });

      if (property) {
        const totalDues = Number(property.annual_tax_amount) + Number(property.arrears);
        return NextResponse.json({
          citizenName: property.owner_name,
          bills: [{
            id: property.id,
            type: 'TAX',
            title: 'Property Tax (घरपट्टी / मालमत्ता कर)',
            consumerId: property.survey_no,
            ownerName: property.owner_name,
            amount: totalDues,
            details: `Survey No: ${property.survey_no} | Area: ${property.area_sqft} sqft | Type: ${property.property_type}`,
            status: 'UNPAID',
          }]
        });
      }

      // 2. Check Water Connection
      const waterConn = await prisma.waterConnection.findUnique({
        where: { connection_number: query },
      });

      if (waterConn) {
        let bill = await prisma.waterBill.findFirst({
          where: {
            connection_id: waterConn.id,
            payment_status: { not: 'SUCCESS' },
          },
          orderBy: { created_at: 'desc' },
        });

        if (!bill) {
          bill = await prisma.waterBill.create({
            data: {
              connection_id: waterConn.id,
              billing_month: 'August 2026',
              amount_due: waterConn.monthly_rate,
              total_amount: waterConn.monthly_rate,
              due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              payment_status: 'INITIATED',
            },
          });
        }

        return NextResponse.json({
          citizenName: waterConn.owner_name,
          bills: [{
            id: bill.id,
            type: 'WATER',
            title: 'Water Bill (पाणी पट्टी)',
            consumerId: waterConn.connection_number,
            ownerName: waterConn.owner_name,
            amount: Number(bill.total_amount),
            details: `Connection No: ${waterConn.connection_number} | Type: ${waterConn.connection_type} | Month: ${bill.billing_month}`,
            status: 'UNPAID',
          }]
        });
      }

      // 3. Fallback Mock Data for single queries
      if (query === '101') {
        return NextResponse.json({
          citizenName: 'Ram Pawar',
          bills: [{
            id: 'demo-tax-id-101',
            type: 'TAX',
            title: 'Property Tax (घरपट्टी / मालमत्ता कर)',
            consumerId: '101',
            ownerName: 'Ram Pawar',
            amount: 2450.00,
            details: 'Survey No: 101 | Area: 1280 sqft | Type: RESIDENTIAL',
            status: 'UNPAID',
          }]
        });
      } else if (query === 'WC-501' || query === '501') {
        return NextResponse.json({
          citizenName: 'Ram Pawar',
          bills: [{
            id: 'demo-water-id-501',
            type: 'WATER',
            title: 'Water Bill (पाणी पट्टी)',
            consumerId: 'WC-501',
            ownerName: 'Ram Pawar',
            amount: 350.00,
            details: 'Connection No: WC-501 | Type: DOMESTIC | Month: August 2026',
            status: 'UNPAID',
          }]
        });
      }

      return NextResponse.json({ error: 'No matches found for that consumer ID' }, { status: 404 });
    }

  } catch (error) {
    console.error('[payment query API error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
