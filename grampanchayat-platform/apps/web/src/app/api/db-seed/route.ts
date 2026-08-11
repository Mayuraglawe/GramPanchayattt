import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({
      message: 'PostgreSQL database seeded successfully with mock profiles, settings, certificates, and grievances.',
    });
  } catch (error: unknown) {
    console.error('[db seed error]', error);
    const message = error instanceof Error ? error.message : 'Seeding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
