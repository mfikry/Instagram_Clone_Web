import axios from 'axios';
import Cookies from 'js-cookie';

// Bikin instance Axios yang udah ngarah ke backend Express kita
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor: Satpam yang ngecek setiap request SEBELUM dikirim ke backend
api.interceptors.request.use(
  (config) => {
    // Ambil token dari brankas Cookie
    const token = Cookies.get('token');
    
    // Kalau tokennya ada, tempelin ke Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;