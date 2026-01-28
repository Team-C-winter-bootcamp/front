import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 개발 모드에서는 Vite 프록시를 통해 localhost:8000으로 연결
// 프로덕션 모드에서는 환경 변수 또는 기본값 사용
const BASE_URL = import.meta.env.DEV 
  ? '/api'  // Vite 프록시가 http://localhost:8000으로 전달
  : (import.meta.env.VITE_API_BASE_URL || '/api');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
