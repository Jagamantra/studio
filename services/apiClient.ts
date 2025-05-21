
import axios from 'axios';
import { projectConfig } from '@/config/project.config';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Base URL set from .env
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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data || error.response.status || error.response);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('API Error Request (No Response):', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Message:', error.message);
    }
    console.error('Full API Error Object:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
