require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.updateMany({
    data: {
      password_hash: '$2b$10$/d5R9cOQmLvm7esX8eV0i.1icGNa9Bk5JBzhllqdWZKVYqpM3dquu'
    }
  });
  console.log('All passwords updated to password123!');
}

main().finally(() => prisma.$disconnect());
