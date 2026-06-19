"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPenilaian } from './actions';

export default function FormUI({ penilaianId, categories }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = categories[currentStep];

  const handleSelect = (pertanyaanId, skor) => {
    setAnswers(prev => ({ ...prev, [pertanyaanId]: skor }));
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount < totalQuestions) {
      alert(`Anda baru menjawab ${answeredCount} dari ${totalQuestions} pertanyaan. Mohon lengkapi semua sebelum submit.`);
      return;
    }

    setIsSubmitting(true);
    const res = await submitPenilaian(penilaianId, answers, catatan);
    if (res.success) {
      alert('Penilaian berhasil disimpan!'); // Notifikasi Berhasil
      router.push('/atasan/form-penilaian');
    } else {
      alert('Gagal mengirim penilaian: ' + res.message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Step Indicator */}
      <div className="steps" style={{ overflowX: 'auto' }}>
        {categories.map((cat, idx) => (
          <div key={cat.name} className={`step ${idx === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(idx)} style={{cursor: 'pointer'}}>
            <div className="step-circle">{idx + 1}</div>
            <div className="step-label">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="card mb-24" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#FFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>
            {currentCategory.name.charAt(0)}
          </div>
          <div className="card-title" style={{ fontSize: '20px' }}>{currentCategory.name}</div>
        </div>

        {currentCategory.questions.length === 0 ? (
          <p style={{fontStyle: 'italic', color: '#94a3b8', margin: '24px 0'}}>Tidak ada pertanyaan di kategori ini.</p>
        ) : (
          currentCategory.questions.map((q, i) => (
            <div key={q.id} className="question-card" style={{ marginTop: '24px' }}>
              <div className="question-number">Pertanyaan {i + 1}</div>
              <div className="question-text">{q.teks_pertanyaan}</div>
              <div className="radio-scale">
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className={`radio-option ${answers[q.id] === val ? 'selected' : ''}`} style={{cursor: 'pointer'}}>
                    <input 
                      type="radio" 
                      name={`q_${q.id}`} 
                      style={{ display: 'none' }} 
                      checked={answers[q.id] === val}
                      onChange={() => handleSelect(q.id, val)}
                    />
                    <div className="radio-circle"></div>
                    <span className="radio-option-val">{val}</span>
                    <span className="radio-option-lbl">
                      {val === 1 ? 'Sangat Kurang' : val === 2 ? 'Kurang' : val === 3 ? 'Cukup' : val === 4 ? 'Baik' : 'Sangat Baik'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Jika di step terakhir, munculkan catatan */}
        {currentStep === categories.length - 1 && (
          <div className="form-group mt-24">
            <label className="form-label" style={{ fontSize: '15px', color: 'var(--primary)' }}>Komentar Kualitatif (Opsional)</label>
            <div className="text-sm text-muted mb-8">Tuliskan apresiasi atau saran membangun untuk orang ini. Komentar bersifat rahasia.</div>
            <textarea 
              className="form-textarea" 
              placeholder="Ketik komentar Anda di sini..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            ></textarea>
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation */}
      <div className="bottom-bar">
        <button 
          className="btn btn-outline" 
          disabled={currentStep === 0 || isSubmitting} 
          onClick={() => setCurrentStep(prev => prev - 1)}
          style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
        >
          Sebelumnya
        </button>
        <span className="bottom-bar-center">{currentStep + 1} / {categories.length} Nilai AKHLAK</span>
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Menyimpan...' : currentStep === categories.length - 1 ? 'Simpan Jawaban' : 'Selanjutnya'}
        </button>
      </div>
    </>
  );
}
