import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

// Flag para controlar refresh em progresso
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    console.log('[API] Token encontrado, adicionando ao header');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('[API] Nenhum token encontrado para requisição a:', config.url);
  }
  return config;
});

// Interceptor para tratar erro 401 e tentar refresh do token
api.interceptors.response.use(
  (response) => {
    console.log('[API] Resposta bem-sucedida:', response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('[API] Erro na requisição:', {
      url: originalRequest.url,
      status: error.response?.status,
      retry: originalRequest._retry
    });
    
    // Se não é uma resposta de erro ou já tentou refresh, retorna erro
    if (!error.response || originalRequest._retry) {
      console.log('[API] Retornando erro sem tentar refresh');
      return Promise.reject(error);
    }

    // Se não é erro 401, retorna erro
    if (error.response.status !== 401) {
      console.log('[API] Erro não é 401, retornando');
      return Promise.reject(error);
    }

    // Se é uma requisição para refresh, não tenta refresh novamente
    if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
      console.log('[API] Erro em rota de autenticação, fazendo logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Marca para não tentar refresh novamente
    originalRequest._retry = true;
    console.log('[API] Tentando fazer refresh do token');

    // Se já está fazendo refresh, aguarda na fila
    if (isRefreshing) {
      console.log('[API] Refresh já em progresso, adicionando à fila');
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      // Sem refresh token, fazer logout
      console.log('[API] Refresh token não encontrado, fazendo logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Tenta fazer refresh do token
      console.log('[API] Enviando refresh token para servidor');
      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { accessToken } = response.data;
      console.log('[API] Novo token recebido, salvando');
      localStorage.setItem('accessToken', accessToken);

      // Processa fila de requisições com o novo token
      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      console.log('[API] Reenviando requisição original com novo token');
      return api(originalRequest);
    } catch (err) {
      // Refresh falhou, fazer logout
      console.error('[API] Refresh falhou, fazendo logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      processQueue(err, null);
      window.location.href = '/login';
      return Promise.reject(err);
    }
  }
);

export default api;
