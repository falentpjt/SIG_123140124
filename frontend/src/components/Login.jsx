import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      const result = register(email, username, password);
      alert(result.message);
      if (result.success) {
        setIsRegister(false);
        setEmail('');
      }
    } else {
      if (!login(username, password)) {
        alert("Username atau Password salah!");
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <form onSubmit={handleSubmit} style={{ padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '1.5rem' }}>
          {isRegister ? 'Daftar Akun' : 'Login WebGIS'}
        </h2>
        
        {isRegister && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '1px', color: '#666' }}>Email</label>
            <input type="email" placeholder="email@itera.ac.id" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '1px', color: '#666' }}>Username</label>
          <input type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} required
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '1px', color: '#666' }}>Password</label>
          <input type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          {isRegister ? 'Daftar Sekarang' : 'Masuk'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} 
          <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>
            {isRegister ? 'Login di sini' : 'Daftar di sini'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
