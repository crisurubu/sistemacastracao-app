import axios from 'axios';

const api = axios.create({
  // MUDANÇA AQUI: Agora aponta para o servidor real da ONG
  baseURL: 'https://sistema-castracao-api.onrender.com/api'
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