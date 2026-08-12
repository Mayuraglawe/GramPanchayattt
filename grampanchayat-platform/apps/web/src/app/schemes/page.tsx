import { prisma } from '@/lib/prisma';
import SchemesClient from './SchemesClient';

export const dynamic = 'force-dynamic';

export default async function SchemesPage() {
  // Query all active schemes from the PostgreSQL database using Prisma
  const schemes = await prisma.scheme.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  // Map values to plain JSON types for the Client Component
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

  return <SchemesClient initialSchemes={formattedSchemes} />;
}
