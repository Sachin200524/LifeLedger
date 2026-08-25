import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifeledger_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lifeledger_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('lifeledger_token');
      if (savedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success) {
            setUser(res.data);
          }
        } catch (e) {
          console.error('Session expired or invalid:', e);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('lifeledger_user', JSON.stringify({ ...user, ...updatedData }));
  };

  const isAuthenticated = !!token && !!user;
  const isUser = user?.role === 'ROLE_USER';
  const isNominee = user?.role === 'ROLE_NOMINEE';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isUser,
        isNominee,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
