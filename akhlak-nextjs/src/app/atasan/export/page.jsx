import prisma from '@/lib/prisma';
import ExportClientUI from '../../manajemen/export/ExportClientUI'; // Reuse component

export const dynamic = 'force-dynamic';

export default async function AtasanExportPage() {
  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  
  return <ExportClientUI periodes={periodes} />;
}
