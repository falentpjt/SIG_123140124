import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [usersList, setUsersList] = useState(JSON.parse(localStorage.getItem('usersList')) || []);

  useEffect(() => {
    localStorage.setItem('usersList', JSON.stringify(usersList));
  }, [usersList]);

  const register = (email, username, password) => {
    const emailExists = usersList.find(u => u.email === email);
    const usernameExists = usersList.find(u => u.username === username);

    if (emailExists) return { success: false, message: "Email sudah terdaftar!" };
    if (usernameExists) return { success: false, message: "Username sudah digunakan!" };

    const newUser = { email, username, password };
    setUsersList([...usersList, newUser]);
    return { success: true, message: "Registrasi berhasil! Silakan login dengan username Anda." };
  };

  const login = (username, password) => {
    // Login menggunakan username
    const foundUser = usersList.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      localStorage.setItem('user', username);
      setUser(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);