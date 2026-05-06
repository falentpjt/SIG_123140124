import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import MapView from "./MapView";
import Login from "./components/Login";
import "./App.css";

const MainContent = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: '1.2rem' }}>WebGIS Fasilitas Publik</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Halo, {user}</span>
          <button onClick={logout} style={{
            padding: '5px 10px', background: '#e74c3c', color: 'white', 
            border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </header>
      <div className="map-wrapper">
        <MapView />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;