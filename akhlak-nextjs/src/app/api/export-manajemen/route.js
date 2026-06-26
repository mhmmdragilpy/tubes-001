import { calculateAllUserScores } from '@/lib/score-utils';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { periodeId } = body;
    
    const allScores = await calculateAllUserScores(periodeId ? parseInt(periodeId, 10) : null);
    
    const headers = ['Nama', 'NIP', 'Divisi', 'Jabatan', 'Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif', 'Skor Akhir', 'Status'];
    const rows = allScores.map(s => [
      s.user.nama_lengkap, s.user.nip, s.user.divisi, s.user.jabatan,
      s.scores.Amanah ?? '-', s.scores.Kompeten ?? '-', s.scores.Harmonis ?? '-', 
      s.scores.Loyal ?? '-', s.scores.Adaptif ?? '-', s.scores.Kolaboratif ?? '-',
      s.scores.avgScore ?? '-', s.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="Executive_Report_AKHLAK.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
