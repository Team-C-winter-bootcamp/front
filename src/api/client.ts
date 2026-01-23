import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL 설정 (환경 변수에서 가져오거나 기본값 사용)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키를 포함하여 요청
  xsrfCookieName: 'csrftoken', // Django의 기본 CSRF 쿠키 이름
  xsrfHeaderName: 'X-CSRFToken', // Django가 헤더에서 찾는 이름
});

// Request 인터셉터: 요청 전에 토큰 추가 등 처리
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // TODO: 인증 토큰 추가 로직 구현
    // localStorage나 다른 방식으로 토큰을 관리할 수 있습니다
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 응답 처리 및 에러 핸들링
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 401 Unauthorized: 토큰 만료 시 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
