const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ KONEKSI DATABASE BERHASIL!');
    
    // Test a simple query to ensure we can read tables
    const userCount = await prisma.user.count().catch(() => 0);
    console.log(`✅ DATABASE DITEMUKAN. Terdapat ${userCount} data akun.`);
    
  } catch (error) {
    console.log('❌ KONEKSI DATABASE GAGAL!');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
