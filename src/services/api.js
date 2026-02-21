import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://sistema-castracao-api.onrender.com/api',
  withCredentials: true 
});

// Interceptor de Resposta: Captura falhas de permissão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Se o cookie for inválido ou expirar, podemos limpar estados locais
      // mas o redirecionamento deve ser feito com cautela para não entrar em loop
      console.warn("Sessão inválida ou sem permissão.");
    }
    return Promise.reject(error);
  }
);

export default api;