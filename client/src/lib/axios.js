import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important for Sanctum CSRF cookies if used
});

// Add a request interceptor to attach the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Language Headers
    const locale = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = locale;
    config.headers['X-Locale'] = locale;

    return config;
});

export default api;
