"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from './actions';
import { FiUser, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginUser(email, password);

    if (res.success) {
      // Save minimal auth info to localStorage so layout can read it
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      // Cookies are now securely set by the server action
      
      // Redirect based on role
      router.push(`/${res.role}/dashboard`);
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {/* Left Side */}
      <div className="login-left">
        <div className="login-brand">
          Sistem Penilaian 360°<br />Core Values AKHLAK
        </div>
        <div className="login-tagline">
          Platform Digital Evaluasi Perilaku Karyawan<br />PT Energi Nusantara
        </div>
        <div style={{ marginTop: '40px', zIndex: 1 }}>
          <svg width="240" height="240" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="rgba(255,255,255,0.2)" d="M42.7,-70.7C55.9,-61.7,67.6,-50.2,75.4,-36.5C83.2,-22.8,87.1,-6.9,84.4,8.1C81.7,23.1,72.4,37.2,60.8,48.6C49.2,60,35.3,68.7,20.1,73.6C4.9,78.5,-11.6,79.5,-26.6,74.7C-41.6,69.9,-55.1,59.3,-64.5,46.1C-73.9,32.9,-79.2,16.5,-79.8,-0.4C-80.4,-17.3,-76.3,-34.6,-66.5,-47.9C-56.7,-61.2,-41.2,-70.5,-26.5,-75.4C-11.8,-80.3,29.5,-79.7,42.7,-70.7Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">360°</div>

          <div className="login-title">Selamat Datang</div>
          <div className="login-subtitle">Masuk ke akun Anda untuk melanjutkan</div>

          {error && (
            <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fca5a5' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{color: 'var(--primary)', fontWeight: 600}}>⚡ Quick Login (Dev Mode)</label>
            <select 
              className="form-input" 
              onChange={(e) => {
                const selectedEmail = e.target.value;
                if (selectedEmail) {
                  setEmail(selectedEmail);
                  setPassword('password123');
                }
              }}
              style={{ borderColor: 'var(--primary)', backgroundColor: '#eff6ff', cursor: 'pointer' }}
            >
              <option value="">-- Pilih Akun Testing --</option>
              <option value="admin-hr@energi.co.id">Admin HR (admin-hr@energi.co.id)</option>
              <option value="manajemen@energi.co.id">Manajemen (manajemen@energi.co.id)</option>
              <option value="atasan@energi.co.id">Atasan (atasan@energi.co.id)</option>
              <option value="karyawan@energi.co.id">Karyawan (karyawan@energi.co.id)</option>
            </select>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="form-input-icon">
                <span className="input-icon" style={{display: 'flex', alignItems: 'center'}}><FiUser size={18}/></span>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Masukkan email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <span className="input-icon" style={{display: 'flex', alignItems: 'center'}}><FiLock size={18}/></span>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="login-options">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> Ingat Saya
              </label>
              <a href="#" style={{ fontWeight: 500 }}>Lupa Password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px', marginBottom: '16px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memvalidasi...' : 'Masuk'}
            </button>
          </form>

          <div className="login-footer" style={{marginTop: '24px'}}>© 2026 PT Energi Nusantara. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
