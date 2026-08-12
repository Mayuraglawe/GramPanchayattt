const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.ferarbzjiyuafviztlzn:Grampanchayat@123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    }
  }
});
p.user.count()
  .then(c => { console.log('✅ Pooler Connected! Users:', c); return p.$disconnect(); })
  .catch(e => { console.error('❌ Error:', e.message); return p.$disconnect(); });
