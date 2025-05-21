
import axios from 'axios';
import { projectConfig } from '@/config/project.config';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies if backend requires them
});

apiClient.interceptors.request.use(
  (config) => {
    // If using token-based authentication (e.g., Bearer tokens in localStorage/sessionStorage)
    // and not relying solely on HttpOnly cookies, you would add the token here:
    // const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    // if (token && !config.url?.includes('/auth/')) { // Don't send token for auth routes typically
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error object first for comprehensive debugging
    console.error("Full API Error Object:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data, config, statusText: responseStatusText } = error.response;
      const url = config?.url || 'N/A';
      
      const baseErrorMessage = `API request to ${url} failed with status ${status}`;
      console.error(baseErrorMessage); // Log status and URL first

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        // Data is a non-empty object
        console.error('Response Data (JSON):', JSON.stringify(data, null, 2));
        // Prefer backend message (data.message or data.error), then a generic message
        error.message = data.message || (data.error ? `${data.error} (Status: ${status})` : baseErrorMessage);
      } else if (data && typeof data !== 'object') {
        // Data is a string or other primitive (e.g. HTML error page from server)
        console.error('Response Data (String/Primitive):', String(data));
        error.message = String(data); // Use the string data as the message
      } else {
        // Data is an empty object {}, null, or undefined
        const statusText = responseStatusText || 'No error message provided by server.';
        console.error(`Response Body: Empty or not a non-empty object. Server Status Text: "${statusText}"`);
        error.message = `${baseErrorMessage}. ${statusText}.`; // Construct a more descriptive message
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received from server for request:', error.request);
      error.message = 'No response received from server. Please check your network connection and the API server status.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error: Error setting up request:', error.message);
      // error.message should already be set by Axios for setup errors
    }
    
    // Fallback if error.message is still not descriptive enough (e.g., became "[object Object]")
    if (!error.message || error.message === "[object Object]") {
        error.message = `An unexpected API error occurred. Status: ${error.response?.status || 'Unknown'}. Please check the console for full details.`;
    }

    return Promise.reject(error); // Important: re-throw the modified/original error
  }
);

export default apiClient;
