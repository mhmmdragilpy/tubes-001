import prisma from '@/lib/prisma';
import ExportClientUI from './ExportClientUI';

export const dynamic = 'force-dynamic';

export default async function ManajemenExportPage() {
  const periodes = await prisma.periode.findMany({ orderBy: { tanggal_mulai: 'desc' } });
  
  return <ExportClientUI periodes={periodes} />;
}
