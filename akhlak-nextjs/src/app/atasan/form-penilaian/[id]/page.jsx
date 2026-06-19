import prisma from '@/lib/prisma';
import FormUI from './FormUI';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FormPenilaianPage({ params }) {
  const { id } = await params;

  // 1. Fetch Penilaian Info
  const penilaian = await prisma.penilaian.findUnique({
    where: { id: parseInt(id) },
    include: { dinilai: true, periode: true }
  });

  if (!penilaian || penilaian.status === 'selesai') {
    return (
      <main className="main-content">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Penilaian tidak ditemukan atau sudah selesai.</h2>
        </div>
      </main>
    );
  }

  // 2. Fetch Questions grouped by category
  const pertanyaanRaw = await prisma.pertanyaan.findMany({
    where: { is_active: true }
  });

  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  
  const questionsByCategory = categories.map(cat => ({
    name: cat,
    questions: pertanyaanRaw.filter(q => q.kategori === cat)
  }));

  return (
    <main className="main-content">
      {/* Header Statis dari Server */}
      <div className="card mb-24" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-main))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="avatar avatar-lg">{penilaian.dinilai.nama_lengkap.substring(0, 2).toUpperCase()}</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{penilaian.dinilai.nama_lengkap}</div>
              <div className="chips">
                <span className="chip" style={{ background: 'var(--primary)', color: '#FFF' }}>{penilaian.dinilai.divisi} — {penilaian.dinilai.jabatan}</span>
                <span className="chip" style={{textTransform: 'capitalize'}}>Penilaian {penilaian.tipe_relasi}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-sm text-muted">Periode: {penilaian.periode.nama_periode}</div>
          </div>
        </div>
      </div>

      {/* Client Component untuk interaktivitas form */}
      <FormUI 
        penilaianId={penilaian.id} 
        categories={questionsByCategory} 
      />
    </main>
  );
}
