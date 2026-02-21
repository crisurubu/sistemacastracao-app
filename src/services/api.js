import axios from 'axios';

const api = axios.create({
  // LÓGICA DE AMBIENTE: Detecta se está local ou no Render
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://sistema-castracao-api.onrender.com/api',
    
  // ESSENCIAL: Permite que o navegador envie e receba cookies HttpOnly
  withCredentials: true 
});

// O interceptor de request agora fica muito mais limpo!
api.interceptors.request.use(config => {
    // Não precisamos mais do localStorage.getItem('token')
    // O navegador anexa o Cookie "accessToken" automaticamente agora.
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;