import prisma from '@/lib/prisma';
import { AddPertanyaanButton, EditPertanyaanButton, TogglePertanyaanButton } from './KuesionerClientUI';

export const dynamic = 'force-dynamic';

export default async function KuesionerPage({ searchParams }) {
  const params = await searchParams;
  const activeTab = params.tab || 'Amanah';
  
  const categories = [
    'Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'
  ];

  const questions = await prisma.pertanyaan.findMany({
    where: {
      kategori: activeTab
    },
    orderBy: {
      id: 'asc'
    }
  });

  const activeCount = questions.filter(q => q.is_active).length;

  const categoryDescriptions = {
    'Amanah': 'Memegang teguh kepercayaan yang diberikan.',
    'Kompeten': 'Terus belajar dan mengembangkan kapabilitas.',
    'Harmonis': 'Saling peduli dan menghargai perbedaan.',
    'Loyal': 'Berdedikasi dan mengutamakan kepentingan Bangsa dan Negara.',
    'Adaptif': 'Terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan.',
    'Kolaboratif': 'Membangun kerja sama yang sinergis.'
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <h1 className="page-title">Kuesioner Digital AKHLAK</h1>
        <AddPertanyaanButton kategori={activeTab} />
      </div>

      <div className="tabs">
        {categories.map(cat => (
          <a 
            key={cat} 
            href={`?tab=${cat}`}
            className={`tab-item ${activeTab === cat ? 'active' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {cat}
          </a>
        ))}
      </div>

      <div className="card mb-24">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="card-title">{activeTab}</div>
          <span className="badge badge-success">{activeCount} Pertanyaan Aktif</span>
        </div>
        <div className="card-subtitle mb-24">{categoryDescriptions[activeTab]}</div>

        {questions.length === 0 && (
          <p className="text-muted">Belum ada pertanyaan untuk kategori ini.</p>
        )}

        {questions.map((q, index) => (
          <div 
            key={q.id} 
            className="question-card" 
            style={{ 
              borderLeft: `4px solid ${q.is_active ? 'var(--primary)' : 'var(--border)'}`,
              opacity: q.is_active ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="question-number">Pertanyaan {index + 1} {!q.is_active && '(Draft)'}</div>
                <div className="question-text">{q.teks_pertanyaan}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <EditPertanyaanButton q={q} />
                <TogglePertanyaanButton q={q} />
              </div>
            </div>
            <div className="text-xs text-muted mt-16">Tipe: Likert Scale 1-5 | Bobot: Normal</div>
          </div>
        ))}
      </div>
    </main>
  );
}
