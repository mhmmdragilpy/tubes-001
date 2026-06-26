const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const user = await prisma.user.findUnique({where: {email: 'admin-hr@energi.co.id'}});
  console.log('Hash in DB:', user.password_hash);
  console.log('Match with password123:', bcrypt.compareSync('password123', user.password_hash));
}
main().finally(() => prisma.$disconnect());
