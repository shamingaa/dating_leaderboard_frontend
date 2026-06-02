import { createContext, useContext, useState, useEffect } from 'react';
import { adminCheck } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [adminExists, setAdminExists] = useState(null);

  useEffect(() => {
    adminCheck()
      .then((res) => setAdminExists(res.data.exists))
      .catch(() => setAdminExists(false));
  }, []);

  const login = (newToken) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setAdminExists(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, adminExists, login, logout, isAdmin: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
