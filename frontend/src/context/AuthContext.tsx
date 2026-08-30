import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('razorpay_token');
      const storedUser = localStorage.getItem('razorpay_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        try {
          // Verify with backend
          const res = await authApi.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('razorpay_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session restore verification failed:', error);
          // Token might be expired, clear it
          localStorage.removeItem('razorpay_token');
          localStorage.removeItem('razorpay_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('razorpay_token', res.data.token);
      localStorage.setItem('razorpay_user', JSON.stringify(res.data.user));
    }
  };

  const register = async (userData: any) => {
    const res = await authApi.register(userData);
    if (res.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('razorpay_token', res.data.token);
      localStorage.setItem('razorpay_user', JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('razorpay_token');
    localStorage.removeItem('razorpay_user');
  };

  const updateProfile = async (profileData: any) => {
    const res = await authApi.updateProfile(profileData);
    if (res.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('razorpay_user', JSON.stringify(res.data.user));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
