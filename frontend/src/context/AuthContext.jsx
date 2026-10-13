import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('opus_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('opus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveAuthSession = (authData) => {
    const userSession = {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
      displayName: authData.displayName,
      profileId: authData.profileId,
    };
    localStorage.setItem('opus_token', authData.token);
    localStorage.setItem('opus_user', JSON.stringify(userSession));
    setToken(authData.token);
    setUser(userSession);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      saveAuthSession(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const registerClient = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/client', data);
      saveAuthSession(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const registerProvider = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/provider', data);
      saveAuthSession(res.data);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('opus_token');
    localStorage.removeItem('opus_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isProvider = user?.role === 'ROLE_PROVIDER';
  const isClient = user?.role === 'ROLE_CLIENT';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        registerClient,
        registerProvider,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isProvider,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
