
import axios from 'axios';
import { projectConfig } from '@/config/project.config';

const apiClient = axios.create({
  baseURL: projectConfig.mockApiMode ? undefined : process.env.NEXT_PUBLIC_API_BASE_URL, // Base URL set conditionally
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
});

apiClient.interceptors.request.use(
  (config) => {
    // If not in mockApiMode, you might attempt to read a token from cookies
    // However, HttpOnly cookies cannot be read by client-side JavaScript.
    // The browser will automatically send them if the domain, path, and secure/samesite attributes match.
    // If using non-HttpOnly cookies (e.g., storing token in localStorage and sending as Bearer),
    // you would add the Authorization header here.
    // For HttpOnly cookies set by the backend, no explicit client-side header addition is needed for the token itself.
    
    // console.log('Axios request config:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common API errors here if needed
    // e.g., if (error.response.status === 401) { logout(); }
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
