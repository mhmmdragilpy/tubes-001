import prisma from '@/lib/prisma';
import IdpReportTable from './IdpReportTable';

export const dynamic = 'force-dynamic';

export default async function ManajemenIdpPage() {
  const idpList = await prisma.idp.findMany({
    include: {
      user: true,
      periode: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  const totalIdp = idpList.length;
  const belumMulai = idpList.filter(item => item.status === 'belum_mulai').length;
  const sedangBerjalan = idpList.filter(item => item.status === 'sedang_berjalan').length;
  const selesai = idpList.filter(item => item.status === 'selesai').length;

  // Format data for client component
  const formattedIdp = idpList.map(item => ({
    id: item.id,
    nip: item.user.nip,
    nama: item.user.nama_lengkap,
    divisi: item.user.divisi,
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
        <h1 className="page-title">Laporan & IDP</h1>
      </div>

      <div className="stat-cards mb-24">
        <div className="stat-card">
          <div className="stat-label">Total Rencana Aksi</div>
          <div className="stat-value">{totalIdp}</div>
          <div className="stat-sub neutral">Rencana Terdaftar</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-label">Belum Mulai</div>
          <div className="stat-value">{belumMulai}</div>
          <div className="stat-sub">Menunggu jadwal</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Sedang Berjalan</div>
          <div className="stat-value">{sedangBerjalan}</div>
          <div className="stat-sub">Dalam progress</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Selesai</div>
          <div className="stat-value">{selesai}</div>
          <div className="stat-sub">Kompetensi tercapai</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div className="card-title">Daftar Rencana Aksi Pengembangan Diri (IDP) Karyawan</div>
        </div>
        <IdpReportTable initialData={formattedIdp} />
      </div>
    </main>
  );
}
