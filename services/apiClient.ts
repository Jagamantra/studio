
import axios from 'axios';
import { projectConfig } from '@/config/project.config';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies if backend requires them
});

apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('genesis_token') : null;
    const url = config.url || '';
    
    // Initialize headers if they don't exist
    config.headers = config.headers || {};
    
    // List of auth routes that don't need token
    const noAuthRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/verify-mfa'
    ];
    
    // Add token if:
    // 1. It's /auth/me or /auth/config
    // 2. OR it's not in the noAuthRoutes list
    if (token && 
        (url === '/auth/me' || 
         url === '/auth/config' || 
         !noAuthRoutes.some(route => url.includes(route)))) {
      
      if (typeof config.headers === 'object') {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Added Authorization header for:', url);
      }
    } else {
      console.log('No Authorization header added. Reason:', !token ? 'No token found' : 'Auth route');
    }
    
    console.log('Final headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || 'N/A';
    let userFriendlyMessage = error.message; // Default to original Axios message

    if (error.response) {
      const { status, data, statusText } = error.response;
      const apiBaseMessage = `API request to ${requestUrl} failed with status ${status}`;

      if (status === 401) {
        userFriendlyMessage = data?.message || "Unauthorized. Your session may have expired or your credentials are not valid. Please try logging in again.";
        console.error(`API Authentication Error (401): ${userFriendlyMessage} URL: ${requestUrl}`);
      } else if (status === 403) {
        userFriendlyMessage = data?.message || "Forbidden. You do not have permission to perform this action or access this resource.";
        console.error(`API Permission Error (403): ${userFriendlyMessage} URL: ${requestUrl}`);
      } else if (status === 500) {
        userFriendlyMessage = data?.message || `A server error occurred (500) while processing your request for ${requestUrl}. Please try again later or contact support if the issue persists.`;
        console.error(`API Server Error (500): ${userFriendlyMessage} URL: ${requestUrl}`);
      } else {
        // For other error statuses
        let detailedMessage = apiBaseMessage;
        const responseDataMessage = typeof data?.message === 'string' ? data.message : (typeof data === 'string' ? data : null);
        
        if (responseDataMessage) {
          detailedMessage += `. Server message: ${responseDataMessage}`;
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          // Try to extract a meaningful message from the data object
          const mainErrorKey = Object.keys(data).find(key => key.toLowerCase().includes('error') || key.toLowerCase().includes('message'));
          if (mainErrorKey && typeof data[mainErrorKey] === 'string') {
            detailedMessage += `. Details: ${data[mainErrorKey]}`;
          } else {
            detailedMessage += `. Response data: ${JSON.stringify(data)}`;
          }
        } else {
          detailedMessage += `. ${statusText || 'No further details from server.'}`;
        }
        userFriendlyMessage = detailedMessage;
        console.error(userFriendlyMessage); // Log the constructed detailed message
      }

      // If the backend provides a structured error (e.g., { statusCode, message, error })
      // and it's more specific, prioritize that for the error.message property.
      if (data?.message && typeof data.message === 'string') {
         // If 'data.message' is an array (e.g. validation errors), join them.
        if (Array.isArray(data.message)) {
          userFriendlyMessage = data.message.join('; ');
        } else {
          userFriendlyMessage = data.message;
        }
      } else if (data?.error && typeof data.error === 'string') {
        userFriendlyMessage = `Error: ${data.error}`;
      }

    } else if (error.request) {
      // The request was made but no response was received
      userFriendlyMessage = `No response received from server for ${requestUrl}. Please check your network connection and the API server status.`;
      console.error(userFriendlyMessage);
    } else {
      // Something happened in setting up the request that triggered an Error
      userFriendlyMessage = `Error setting up API request to ${requestUrl}: ${error.message}`;
      console.error(userFriendlyMessage);
    }

    // Ensure the error object that's rejected carries the most user-friendly message
    error.message = userFriendlyMessage;

    // For detailed debugging, one might still want to log the full error object.
    // This will still show "AxiosError: ..." by default when the error object is stringified by the console.
    // console.error('Full AxiosError Object (for debugging):', error);

    return Promise.reject(error);
  }
);

export default apiClient;
