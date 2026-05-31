import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL;

if (!apiURL) {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Dynamically fallback to secure production backend if running on deployed remote domains like Vercel
    apiURL = 'https://physioconnect-api.onrender.com';
  } else {
    // Default local fallback
    apiURL = 'http://localhost:5000';
  }
}

const axiosInstance = axios.create({
  baseURL: `${apiURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('theralign_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto-logout on 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user info
      localStorage.removeItem('theralign_token');
      localStorage.removeItem('theralign_user');
      // Redirect to login page if window is defined
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
