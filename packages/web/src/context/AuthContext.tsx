import React, { createContext, useEffect, useState } from 'react';
import type { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verifica se usuário está logado ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[CONTEXT] Verificando autenticação');
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          console.log('[CONTEXT] Token encontrado, buscando dados do usuário');
          try {
            const userData = await authService.getCurrentUser();
            console.log('[CONTEXT] Usuário carregado com sucesso:', userData);
            setUser(userData);
          } catch (err: any) {
            console.error('[CONTEXT] Erro ao carregar usuário:', err);
            // Token inválido, limpar armazenamento
            console.log('[CONTEXT] Removendo tokens inválidos');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        } else {
          console.log('[CONTEXT] Nenhum token encontrado');
          setUser(null);
        }
      } catch (err) {
        console.error('[CONTEXT] Erro crítico em checkAuth:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[CONTEXT] Iniciando login para:', email);
      setError(null);
      const result = await authService.login({ email, password });
      console.log('[CONTEXT] Login bem-sucedido, atualizando estado do usuário');
      setUser(result.user);
      console.log('[CONTEXT] isAuthenticated será true, navegação deve ocorrer');
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      console.error('[CONTEXT] Erro no login:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      console.log('[CONTEXT] Iniciando registro para:', email);
      setError(null);
      const result = await authService.register({ email, name, password });
      console.log('[CONTEXT] Registro bem-sucedido, atualizando estado do usuário');
      setUser(result.user);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar';
      console.error('[CONTEXT] Erro no registro:', errorMessage);
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
