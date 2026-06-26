"use client";

import { useEffect, useState, useRef } from 'react';
import { updateProfile, changePassword } from '@/lib/profil-actions';
import { FiCamera } from 'react-icons/fi';

export default function ProfilClient() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const profileFormRef = useRef(null);
  const passwordFormRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({
        ...parsed,
        initial: parsed.nama.substring(0, 2).toUpperCase()
      });
    }
  }, []);

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProfile = async (formData) => {
    const res = await updateProfile(user.id, formData);
    if (res.success) {
      showNotif('success', res.message);
      const newName = formData.get('nama_lengkap');
      const updatedUser = { ...user, nama: newName, initial: newName.substring(0, 2).toUpperCase() };
      setUser(updatedUser);
      const stored = JSON.parse(localStorage.getItem('auth_user'));
      localStorage.setItem('auth_user', JSON.stringify({ ...stored, nama: newName }));
    } else {
      showNotif('error', res.message);
    }
  };

  const handleChangePassword = async (formData) => {
    const res = await changePassword(user.id, formData);
    if (res.success) {
      showNotif('success', res.message);
      passwordFormRef.current?.reset();
    } else {
      showNotif('error', res.message);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotif('error', 'Ukuran gambar maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        showNotif('success', data.message);
        const updatedUser = { ...user, avatar_url: data.avatar_url };
        setUser(updatedUser);
        
        // Update local storage
        const stored = JSON.parse(localStorage.getItem('auth_user'));
        localStorage.setItem('auth_user', JSON.stringify({ ...stored, avatar_url: data.avatar_url }));
        
        // Dispatch custom event to update Sidebar
        window.dispatchEvent(new Event('auth_user_updated'));
      } else {
        showNotif('error', data.message);
      }
    } catch (error) {
      showNotif('error', 'Terjadi kesalahan saat mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return <main className="main-content"><p>Loading profile...</p></main>;

  return (
    <main className="main-content">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 99999,
          padding: '16px 24px', borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: '#FFF', fontWeight: 600, fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.3s ease'
        }}>
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}

      <div className="page-header"><h1 className="page-title">Manajemen Profil</h1></div>

      <div className="grid-35-65">
        {/* Profil Card */}
        <div className="card text-center" style={{position: 'relative', overflow: 'hidden'}}>
          <div style={{height: '100px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0}}></div>
          
          {/* Avatar Upload Container */}
          <div style={{ position: 'relative', width: '96px', height: '96px', margin: '40px auto 0', zIndex: 1 }}>
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #FFF', backgroundColor: '#FFF' }}
              />
            ) : (
              <div className="avatar avatar-xl" style={{ margin: 0, width: '100%', height: '100%', border: '4px solid #FFF' }}>{user.initial}</div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--primary)', color: '#FFF',
                border: '2px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', padding: 0
              }}
              title="Ubah Foto Profil"
            >
              <FiCamera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/jpeg, image/png, image/webp" 
              style={{ display: 'none' }} 
            />
          </div>

          <div style={{marginTop: '16px', fontSize: '20px', fontWeight: 700, color: 'var(--primary)'}}>{user.nama}</div>
          <span className="badge badge-primary" style={{marginTop: '8px', textTransform: 'capitalize'}}>{user.role.replace('-', ' ')}</span>
          <div style={{marginTop: '20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}><span>Divisi</span><strong style={{color: 'var(--text-main)'}}>{user.divisi}</strong></div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Email</span><strong style={{color: 'var(--text-main)'}}>{user.email}</strong></div>
          </div>
        </div>

        {/* Forms */}
        <div>
          <div className="card mb-24">
            <div className="card-title mb-16">Informasi Pribadi</div>
            <form ref={profileFormRef} action={handleUpdateProfile}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" name="nama_lengkap" className="form-input" defaultValue={user.nama} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" defaultValue={user.email} disabled style={{background: 'var(--bg-main)', cursor: 'not-allowed'}} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Divisi</label>
                  <input type="text" className="form-input" defaultValue={user.divisi} disabled style={{background: 'var(--bg-main)', cursor: 'not-allowed'}} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-16">Simpan Perubahan</button>
            </form>
          </div>

          <div className="card">
            <div className="card-title mb-16">Keamanan Akun</div>
            <form ref={passwordFormRef} action={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Password Lama</label>
                <input type="password" name="old_password" className="form-input" placeholder="Masukkan password saat ini" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input type="password" name="new_password" className="form-input" placeholder="Minimal 8 karakter" required />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input type="password" name="confirm_password" className="form-input" placeholder="Ulangi password baru" required />
              </div>
              <button type="submit" className="btn btn-primary mt-16">Ubah Password</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
