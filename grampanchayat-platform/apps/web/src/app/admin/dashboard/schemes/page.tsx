import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import SchemesDashboardClient from './SchemesDashboardClient';
import { getUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminSchemesDashboard() {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const name = h.get('x-user-name') ?? 'Admin';

  // Find user details to obtain the ward number
  const allUsers = await getUsers();
  const dbUser = allUsers.find((u) => u.id === userId);
  const wardNo = dbUser?.ward_no ?? 1;

  // Retrieve all schemes registered in the database
  const schemes = await prisma.scheme.findMany({
    orderBy: {
      created_at: 'desc',
    },
  });

  const formattedSchemes = schemes.map((s) => ({
    id: s.id,
    scheme_code: s.scheme_code,
    name: s.name,
    name_mr: s.name_mr,
    description: s.description,
    description_mr: s.description_mr,
    government_level: s.government_level,
    ministry: s.ministry,
    eligibility: s.eligibility ? JSON.parse(JSON.stringify(s.eligibility)) : {},
    benefits: s.benefits,
    benefits_mr: s.benefits_mr,
    application_url: s.application_url,
    helpline: s.helpline,
  }));

  return (
    <SchemesDashboardClient
      adminName={name}
      wardNo={wardNo}
      initialSchemes={formattedSchemes}
    />
  );
}
