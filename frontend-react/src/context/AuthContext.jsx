import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bbms_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('bbms_user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, token) => {
    localStorage.setItem('bbms_token', token);
    localStorage.setItem('bbms_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);

    const redirectMap = {
      donor: '/donor-dashboard',
      recipient: '/patient-dashboard',
      staff: '/hospital-dashboard',
      admin: '/admin-dashboard',
    };
    navigate(redirectMap[userData.role] || '/');
  };

  const logout = () => {
    localStorage.removeItem('bbms_token');
    localStorage.removeItem('bbms_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
