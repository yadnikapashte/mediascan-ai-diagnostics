import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mediascan_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (error) {
          console.error('Auth verification failed', error);
          localStorage.removeItem('mediascan_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('mediascan_token', res.data.token);
      setUser(res.data.user);
      toast.success('MediScan Login: Success');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failure');
      return false;
    }
  };

  const signup = async (data) => {
    try {
      const res = await authAPI.signup(data);
      localStorage.setItem('mediascan_token', res.data.token);
      setUser(res.data.user);
      toast.success('MediScan Registration: Success');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failure');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mediascan_token');
    setUser(null);
    toast.success('MediScan Session Ended');
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      updateLocalUser,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
