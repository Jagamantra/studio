
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

    const requestUrl = error.config?.url || 'N/A';
    let customErrorMessage: string | null = null;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data, statusText: responseStatusText } = error.response;
      const baseErrorMessage = `API request to ${requestUrl} failed with status ${status}`;
      console.error(baseErrorMessage); // Log status and URL first

      if (status === 401) {
        customErrorMessage = data?.message || "Unauthorized. Please check your credentials or ensure your session is active.";
        console.error(`API Authentication Error (401): ${customErrorMessage}`);
      } else if (status === 403) {
        customErrorMessage = data?.message || "Forbidden. You do not have permission to perform this action or access this resource.";
        console.error(`API Permission Error (403): ${customErrorMessage}`);
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        // Data is a non-empty object
        console.error('Response Data (JSON):', JSON.stringify(data, null, 2));
        customErrorMessage = data.message || (data.error ? `${data.error} (Status: ${status})` : baseErrorMessage);
      } else if (data && typeof data !== 'object') {
        // Data is a string or other primitive (e.g. HTML error page from server)
        console.error('Response Data (String/Primitive):', String(data));
        customErrorMessage = String(data);
      } else {
        // Data is an empty object {}, null, or undefined
        const statusText = responseStatusText || 'No error message provided by server.';
        console.error(`Response Body: Empty or not a non-empty object. Server Status Text: "${statusText}"`);
        customErrorMessage = `${baseErrorMessage}. ${statusText}.`;
      }
      // Ensure error.message is updated with the custom message
      error.message = customErrorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received from server for request to', requestUrl, error.request);
      error.message = 'No response received from server. Please check your network connection and the API server status.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error: Error setting up request to', requestUrl, error.message);
      // error.message should already be set by Axios for setup errors
    }
    
    // Fallback if error.message is still not descriptive enough or is the generic Axios message
    if (!error.message || String(error.message).includes('Request failed with status code')) {
        const status = error.response?.status || 'Unknown';
        const statusText = error.response?.statusText || 'An unexpected error occurred.';
        // Provide a more structured default error message
        let detailedMessage = `API Error`;
        if (status !== 'Unknown') detailedMessage += ` (${status})`;
        detailedMessage += `: ${statusText}`;
        if (requestUrl !== 'N/A') detailedMessage += `. URL: ${requestUrl}`;
        error.message = detailedMessage;
    }

    return Promise.reject(error); // Important: re-throw the modified/original error
  }
);

export default apiClient;
