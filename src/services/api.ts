import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const userStorage = localStorage.getItem('business_nexus_user');
    let token = null;
    
    if (userStorage) {
      try {
        const parsed = JSON.parse(userStorage);
        token = parsed.token;
      } catch (e) {
        console.error('Failed to parse user storage', e);
      }
    }

    // Fallback if token is stored separately
    if (!token) {
      token = localStorage.getItem('business_nexus_token');
    }

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
