import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// AQUI É ONDE O ERRO 403 MORRE:
// Este interceptor "carimba" o token em toda chamada que você fizer usando 'api'
api.interceptors.request.use(config => {
    // 1. Busca o token que o Login salvou no seu localStorage
    const token = localStorage.getItem('token');
    
    // 2. Se a chave existir, coloca ela no envelope (header) da requisição
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;