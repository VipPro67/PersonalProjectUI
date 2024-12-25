import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://20.39.224.87:5000/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      config.headers['Accept-Language'] = localStorage.getItem('acceptLanguage') || 'en-US';
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { response } = await axios.post('http://20.39.224.87:5000/api/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
        const newToken = response.data.accessToken;
        
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
        }
        
        if (newToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;