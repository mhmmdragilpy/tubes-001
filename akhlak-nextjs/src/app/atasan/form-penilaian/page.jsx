import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import StartPenilaianClient from './StartPenilaianClient';

export const dynamic = 'force-dynamic';

export default async function AtasanFormPenilaianList() {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get('userId');
  const userIdStr = userIdCookie ? userIdCookie.value : null;

  if (!userIdStr) {
    return (
      <main className="main-content">
        <div className="card mb-24" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: '#fef2f2' }}>
          <div style={{ padding: '16px 0' }}>
            <h3 style={{color: '#991b1b', marginBottom: '8px'}}>Sesi Berakhir / Cookie Tidak Ditemukan</h3>
            <p style={{color: '#7f1d1d', fontSize: '14px'}}>Silakan login ulang untuk melihat daftar penilaian Anda.</p>
            <Link href="/login" className="btn btn-sm btn-primary mt-16" style={{display: 'inline-block'}}>Login Ulang</Link>
          </div>
        </div>
      </main>
    );
  }

  const userId = parseInt(userIdStr);

  const activePeriode = await prisma.periode.findFirst({
    where: { is_active: true }
  });

  const bawahanList = await prisma.user.findMany({
    where: { atasan_id: userId }
  });

  const assignments = await prisma.penilaian.findMany({
    where: {
      penilai_id: userId,
      periode: {
        is_active: true
      }
    },
    include: {
      dinilai: true,
      periode: true
    }
  });

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Daftar Form Penilaian</h1>
      </div>

      <div className="card mb-24">
        <p className="text-muted" style={{marginBottom: '16px'}}>
          Berikut adalah daftar rekan sejawat atau bawahan yang perlu Anda evaluasi berdasarkan Core Values AKHLAK untuk periode aktif.
        </p>

        {activePeriode && <StartPenilaianClient bawahanList={bawahanList} activePeriodeId={activePeriode.id} />}

        {assignments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{color: '#64748b'}}>Hore! 🎉</h3>
            <p style={{color: '#94a3b8', fontSize: '14px', marginTop: '8px'}}>Anda belum memiliki tugas evaluasi, atau Anda sudah menyelesaikan semuanya.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assignments.map((task) => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span className="avatar avatar-md">{task.dinilai.nama_lengkap.substring(0, 2).toUpperCase()}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{task.dinilai.nama_lengkap}</div>
                    <div className="chips" style={{marginTop: '4px'}}>
                      <span className="chip" style={{background: 'var(--primary)', color: '#FFF'}}>{task.dinilai.divisi} — {task.dinilai.jabatan}</span>
                      <span className="chip" style={{textTransform: 'capitalize'}}>Penilaian: {task.tipe_relasi}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {task.status === 'selesai' ? (
                    <span className="badge badge-success">Selesai</span>
                  ) : (
                    <Link href={`/atasan/form-penilaian/${task.id}`} className="btn btn-primary">
                      {task.status === 'proses' ? 'Lanjutkan Penilaian' : 'Mulai Penilaian'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
