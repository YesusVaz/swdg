import React, { createContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (err: any) {
            console.error('Erro ao carregar usuário:', err);
            // Token inválido, limpar localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro em checkAuth:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await authService.login({ email, password });
      setUser(result.user);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      setError(null);
      const result = await authService.register({ email, name, password });
      setUser(result.user);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
