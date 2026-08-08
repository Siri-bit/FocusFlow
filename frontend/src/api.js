import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
=======
  baseURL: 'http://localhost:8000/api/',
>>>>>>> d763c6ecd265dabce2f36472b1a12ac3d7f3673c
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Basic refresh token logic placeholder
    return Promise.reject(error);
  }
);

export default api;
