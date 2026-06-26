import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IdpClientUI from './IdpClientUI';

export const dynamic = 'force-dynamic';

export default async function KaryawanIdpPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  
  if (!userIdCookie) {
    redirect('/login');
  }
  
  const userId = parseInt(userIdCookie.value);

  // Ambil periode aktif
  const periodes = await prisma.periode.findMany({ 
    where: { is_active: true },
    orderBy: { tanggal_mulai: 'desc' }
  });
  
  const activePeriode = periodes.length > 0 ? periodes[0] : null;

  // Ambil data IDP karyawan ini
  const idpList = await prisma.idp.findMany({
    where: { user_id: userId },
    include: { periode: true },
    orderBy: { created_at: 'desc' }
  });

  const formattedIdp = idpList.map(item => ({
    id: item.id,
    periode: item.periode.nama_periode,
    area: item.area_pengembangan,
    target: item.target_akhir,
    rencana: item.rencana_aksi,
    timeline: item.timeline,
    status: item.status
  }));

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Laporan & IDP</h1>
      </div>
      
      <IdpClientUI 
        initialIdps={formattedIdp} 
        activePeriode={activePeriode}
      />
    </main>
  );
}
