import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('[AUTH] Iniciando login com email:', data.email);
      const response = await api.post('/auth/login', data);
      console.log('[AUTH] Resposta do login:', response.data);
      
      // A API retorna { success, message, data: { user, accessToken, refreshToken } }
      const { accessToken, refreshToken, user } = response.data.data;
      
      if (!accessToken || !refreshToken) {
        console.error('[AUTH] Tokens não recebidos na resposta:', { accessToken, refreshToken });
        throw new Error('Tokens não recebidos da API');
      }
      
      console.log('[AUTH] Salvando tokens no localStorage');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('[AUTH] Login bem-sucedido, usuário:', user);
      return { user, accessToken, refreshToken };
    } catch (error: any) {
      console.error('[AUTH] Erro ao fazer login:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log('[AUTH] Iniciando registro com email:', data.email);
      const response = await api.post('/auth/register', data);
      console.log('[AUTH] Resposta do registro:', response.data);
      
      // A API retorna { success, message, data: { user, accessToken, refreshToken } }
      const { accessToken, refreshToken, user } = response.data.data;
      
      if (!accessToken || !refreshToken) {
        console.error('[AUTH] Tokens não recebidos na resposta:', { accessToken, refreshToken });
        throw new Error('Tokens não recebidos da API');
      }
      
      console.log('[AUTH] Salvando tokens no localStorage');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('[AUTH] Registro bem-sucedido, usuário:', user);
      return { user, accessToken, refreshToken };
    } catch (error: any) {
      console.error('[AUTH] Erro ao registrar:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    console.log('[AUTH] Realizando logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async () => {
    try {
      console.log('[AUTH] Buscando usuário atual');
      const response = await api.get('/users/me');
      console.log('[AUTH] Usuário atual retornado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Erro ao buscar usuário atual:', error.response?.data || error.message);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      console.log('[AUTH] Tentando fazer refresh do token');
      const response = await api.post('/auth/refresh', { refreshToken });
      
      // A API pode retornar { success, message, data: { accessToken } } ou diretamente { accessToken }
      const accessToken = response.data.data?.accessToken || response.data.accessToken;
      
      if (!accessToken) {
        throw new Error('Access token não recebido no refresh');
      }
      
      console.log('[AUTH] Token refresh bem-sucedido');
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error: any) {
      console.error('[AUTH] Erro ao fazer refresh:', error.response?.data || error.message);
      throw error;
    }
  },
};

