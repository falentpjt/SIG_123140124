import React, { useState } from 'react';
import axios from 'axios';
import MapView from './components/MapView';

const AuthForm = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? 'http://localhost:8000/register' : 'http://localhost:8000/login';
    try {
      if (isRegister) {
        await axios.post(url, { email, password });
        alert("Registrasi Berhasil! Silakan Login.");
        setIsRegister(false);
      } else {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await axios.post(url, formData);
        localStorage.setItem('token', res.data.access_token);
        const username = email.split('@')[0];
        localStorage.setItem('user_email', username); 
        onLoginSuccess(username);
      }
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.detail || "Terjadi kesalahan"));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#1e293b' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '2rem' }}>{isRegister ? 'Daftar Akun' : 'Login WebGIS'}</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required 
               style={{ width: '100%', padding: '12px', marginBottom: '1.2rem', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '6px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} 
               maxLength={72} required style={{ width: '100%', padding: '12px', marginBottom: '1.8rem', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '6px' }} />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#254a3b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}>
          {isRegister ? 'DAFTAR SEKARANG' : 'MASUK'}
        </button>
        <p onClick={() => setIsRegister(!isRegister)} style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: '#3b82f6', fontSize: '0.9rem' }}>
          {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
        </p>
      </form>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user_email') || null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <AuthForm onLoginSuccess={setUser} />;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
      <header style={{ 
        height: '60px', 
        width: '100%',
        padding: '0 2rem', 
        background: '#254a3b', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxSizing: 'border-box',
        zIndex: 1000 
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>WebGIS Fasilitas Publik Lampung</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.95rem' }}>Halo, <b>{user}</b></span>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </header>
      <main style={{ flex: 1, width: '100%', position: 'relative', margin: 0, padding: 0 }}>
        <MapView />
      </main>
    </div>
  );
}
