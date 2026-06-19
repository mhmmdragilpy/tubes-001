import prisma from '@/lib/prisma';

/**
 * Calculate per-category AKHLAK scores for a given user (dinilai).
 * Returns: { Amanah: 4.2, Kompeten: 3.8, ... , avgScore: 4.1, totalPenilai: 3 }
 */
export async function calculateUserScores(dinilaiId, periodeId = null) {
  const where = { dinilai_id: dinilaiId, status: 'selesai' };
  if (periodeId) where.periode_id = periodeId;

  const penilaian = await prisma.penilaian.findMany({
    where,
    include: {
      detail_penilaian: {
        include: { pertanyaan: true }
      }
    }
  });

  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  const catScores = {};
  categories.forEach(c => { catScores[c] = { total: 0, count: 0 }; });

  penilaian.forEach(p => {
    p.detail_penilaian.forEach(dp => {
      const cat = dp.pertanyaan.kategori;
      if (catScores[cat]) {
        catScores[cat].total += dp.skor;
        catScores[cat].count += 1;
      }
    });
  });

  const result = {};
  let overallTotal = 0;
  let overallCount = 0;

  categories.forEach(c => {
    if (catScores[c].count > 0) {
      result[c] = parseFloat((catScores[c].total / catScores[c].count).toFixed(1));
      overallTotal += result[c];
      overallCount += 1;
    } else {
      result[c] = null;
    }
  });

  result.avgScore = overallCount > 0 ? parseFloat((overallTotal / overallCount).toFixed(1)) : null;
  result.totalPenilai = penilaian.length;

  return result;
}

/**
 * Calculate scores grouped by tipe_relasi (atasan, peer, bawahan, self)
 */
export async function calculateScoresBySource(dinilaiId, periodeId = null) {
  const where = { dinilai_id: dinilaiId, status: 'selesai' };
  if (periodeId) where.periode_id = periodeId;

  const penilaian = await prisma.penilaian.findMany({
    where,
    include: {
      detail_penilaian: {
        include: { pertanyaan: true }
      }
    }
  });

  const sources = ['atasan', 'peer', 'bawahan', 'self'];
  const sourceScores = {};
  sources.forEach(s => { sourceScores[s] = { total: 0, count: 0 }; });

  // Also calculate per-category for self vs others (gap analysis)
  const categories = ['Amanah', 'Kompeten', 'Harmonis', 'Loyal', 'Adaptif', 'Kolaboratif'];
  const selfCat = {};
  const othersCat = {};
  categories.forEach(c => {
    selfCat[c] = { total: 0, count: 0 };
    othersCat[c] = { total: 0, count: 0 };
  });

  penilaian.forEach(p => {
    let pTotal = 0;
    let pCount = 0;
    p.detail_penilaian.forEach(dp => {
      pTotal += dp.skor;
      pCount += 1;
      
      const cat = dp.pertanyaan.kategori;
      if (p.tipe_relasi === 'self') {
        selfCat[cat].total += dp.skor;
        selfCat[cat].count += 1;
      } else {
        othersCat[cat].total += dp.skor;
        othersCat[cat].count += 1;
      }
    });
    if (pCount > 0) {
      sourceScores[p.tipe_relasi].total += pTotal / pCount;
      sourceScores[p.tipe_relasi].count += 1;
    }
  });

  const result = {};
  sources.forEach(s => {
    result[s] = sourceScores[s].count > 0 ? parseFloat((sourceScores[s].total / sourceScores[s].count).toFixed(1)) : null;
  });

  // Gap analysis
  result.gap = {};
  categories.forEach(c => {
    const selfAvg = selfCat[c].count > 0 ? selfCat[c].total / selfCat[c].count : null;
    const othersAvg = othersCat[c].count > 0 ? othersCat[c].total / othersCat[c].count : null;
    result.gap[c] = {
      self: selfAvg ? parseFloat(selfAvg.toFixed(1)) : null,
      others: othersAvg ? parseFloat(othersAvg.toFixed(1)) : null,
      diff: (selfAvg !== null && othersAvg !== null) ? parseFloat((othersAvg - selfAvg).toFixed(1)) : null
    };
  });

  // Qualitative feedback
  result.feedback = penilaian
    .filter(p => p.catatan_kualitatif && p.catatan_kualitatif.trim())
    .map(p => ({
      tipe_relasi: p.tipe_relasi,
      catatan: p.catatan_kualitatif
    }));

  return result;
}

/**
 * Calculate scores for all users (for rekap/leaderboard)
 */
export async function calculateAllUserScores(periodeId = null) {
  const users = await prisma.user.findMany({
    where: { role: { not: 'admin_hr' } },
    orderBy: { nama_lengkap: 'asc' }
  });

  const results = [];
  for (const user of users) {
    const scores = await calculateUserScores(user.id, periodeId);
    const allPenilaian = await prisma.penilaian.count({
      where: {
        dinilai_id: user.id,
        ...(periodeId ? { periode_id: periodeId } : {})
      }
    });
    const selesaiPenilaian = await prisma.penilaian.count({
      where: {
        dinilai_id: user.id,
        status: 'selesai',
        ...(periodeId ? { periode_id: periodeId } : {})
      }
    });
    
    results.push({
      user,
      scores,
      status: allPenilaian === 0 ? 'Belum' : (selesaiPenilaian === allPenilaian ? 'Selesai' : 'Proses')
    });
  }

  return results.sort((a, b) => (b.scores.avgScore || 0) - (a.scores.avgScore || 0));
}
