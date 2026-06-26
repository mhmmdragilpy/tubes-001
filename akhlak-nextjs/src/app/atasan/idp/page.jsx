import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IdpApprovalClient from './IdpApprovalClient';

export const dynamic = 'force-dynamic';

export default async function AtasanIdpPage() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  
  if (!userIdCookie) {
    redirect('/login');
  }
  
  const userId = parseInt(userIdCookie.value);

  // Ambil IDP bawahan
  const idpList = await prisma.idp.findMany({
    where: { 
      user: { atasan_id: userId } 
    },
    include: { 
      periode: true,
      user: true
    },
    orderBy: { created_at: 'desc' }
  });

  const formattedIdp = idpList.map(item => ({
    id: item.id,
    nama: item.user.nama_lengkap,
    nip: item.user.nip,
    jabatan: item.user.jabatan,
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
        <h1 className="page-title">Approval IDP</h1>
      </div>
      
      <div className="card">
        <div className="card-header mb-16">
          <div className="card-title">Daftar Rencana Aksi Bawahan</div>
        </div>
        <IdpApprovalClient initialIdps={formattedIdp} />
      </div>
    </main>
  );
}
