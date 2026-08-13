import { initDb } from '../../web/src/lib/db';
initDb().then(() => console.log('Seeded successfully')).catch(console.error);
