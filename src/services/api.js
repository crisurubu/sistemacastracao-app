import axios from 'axios';

const api = axios.create({
  // Detecta automaticamente o ambiente (Local ou Nuvem)
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://sistema-castracao-api.onrender.com/api',
  withCredentials: true 
});

// Interceptor de Resposta: Gerencia erros de autenticação globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.warn("⚠️ Sessão expirada ou sem permissão. Verifique o login.");
        
        // Opcional: Se não for uma rota pública, redirecionar para login
        // if (!window.location.pathname.includes('/login')) {
        //   window.location.href = '/login';
        // }
      }
    }
    return Promise.reject(error);
  }
);

export default api;