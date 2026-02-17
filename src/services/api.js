import axios from 'axios';

const api = axios.create({
  // LÓGICA DE AMBIENTE: Detecta se você está em casa ou no servidor real
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : 'https://sistema-castracao-api.onrender.com/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;