import axios from 'axios';
import Cookies from 'js-cookie'; // Pastikan lu import js-cookie

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  // INI PENTING BANGET: Biar axios selalu bawa Cookies pas nyebrang
  withCredentials: true, 
});

// Interceptor buat nyelipin Token ke setiap request (termasuk pas buka profil)
api.interceptors.request.use(
  (config) => {
    // Ambil token dari brankas Cookies
    const token = Cookies.get('token'); 
    
    if (token) {
      // Pakaikan token ke kepala surat (Header)
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;