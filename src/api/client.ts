import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL 설정 (환경 변수에서 가져오거나 기본값 사용)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: 요청 전에 토큰 추가 등 처리
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Clerk에서 토큰 가져오기
    try {
      const clerkToken = await getClerkToken();
      if (clerkToken && config.headers) {
        config.headers.Authorization = `Bearer ${clerkToken}`;
      }
    } catch (error) {
      console.warn('토큰을 가져오는데 실패했습니다:', error);
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

/**
 * Clerk 토큰을 가져오는 헬퍼 함수
 * Clerk의 getToken은 React 컴포넌트 내에서만 사용 가능하므로,
 * API 클라이언트에서는 window 객체를 통해 토큰을 가져옵니다.
 */
async function getClerkToken(): Promise<string | null> {
  try {
    // Clerk의 window.__clerk 객체를 통해 토큰 가져오기
    if (typeof window !== 'undefined' && (window as any).__clerk) {
      const clerk = (window as any).__clerk;
      if (clerk.session) {
        return await clerk.session.getToken();
      }
    }
    // 대체 방법: localStorage에서 토큰 가져오기 (임시)
    return localStorage.getItem('clerk-session-token');
  } catch (error) {
    console.warn('Clerk 토큰을 가져오는데 실패했습니다:', error);
    return null;
  }
}

export default apiClient;
