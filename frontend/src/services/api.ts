import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Removed default Content-Type to allow Axios to set multipart/form-data for FormData
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Client Request Interceptor: Adding token to request:', token ? 'Token present' : 'No token');
    console.log('Client Request Interceptor: Request URL:', config.url, 'Method:', config.method);
    console.log('Client Request Interceptor: Headers:', config.headers);
    if (config.data instanceof FormData) {
      console.log('Client Request Interceptor: FormData detected - keys:', Array.from(config.data.keys()));
      // Ensure Content-Type is not set for FormData; Axios will set multipart/form-data with boundary
      delete config.headers['Content-Type'];
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Client Request Interceptor Error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Client Response Interceptor: Response received from URL:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Client Response Interceptor Error:', error.response?.status, error.message, 'Response Data:', error.response?.data);
    if (error.response?.status === 401) {
      console.log('Client: 401 Unauthorized - Clearing token');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;