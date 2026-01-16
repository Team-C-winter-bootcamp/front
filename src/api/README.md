# API 연동 가이드

이 문서는 프로젝트에서 API를 연동하는 방법을 설명합니다.

## 📁 폴더 구조

```
src/api/
├── client.ts              # Axios 인스턴스 및 인터셉터 설정
├── types.ts               # API 타입 정의
├── endpoints.ts           # API 엔드포인트 상수
├── services/              # API 서비스 함수들
│   └── Service.ts         # 관련 API
├── index.ts               # 통합 export
└── README.md              # 이 파일
```

## 🚀 시작하기

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 API Base URL을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

`.env.example` 파일을 참고하여 설정할 수 있습니다.

### 2. API 클라이언트 사용

#### 기본 사용법

```typescript
import { apiClient } from '@/api'

// GET 요청
const response = await apiClient.get('/users')
console.log(response.data)

// POST 요청
const response = await apiClient.post('/users', {
  name: 'John',
  email: 'john@example.com'
})
```

#### 서비스 함수 사용 (권장)

```typescript
import { Service} from '@/api'

// 로그인
try {
  const result = await Service.login({
    email: 'user@example.com',
    password: 'password123'
  })
  console.log('로그인 성공:', result)
} catch (error) {
  console.error('로그인 실패:', error)
}

// 검색
try {
  const results = await Service.search({
    query: '계약금',
    page: 1,
    limit: 10
  })
  console.log('검색 결과:', results)
} catch (error) {
  console.error('검색 실패:', error)
}
```

## 📝 새로운 API 엔드포인트 추가하기

### 1. 엔드포인트 상수 추가

`src/api/endpoints.ts`에 엔드포인트를 추가합니다:

```typescript
export const API_ENDPOINTS = {
  // ... 기존 엔드포인트
  USERS: {
    LIST: '/users',
    DETAIL: '/users/:id',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
  },
} as const
```

### 2. 타입 정의 추가

`src/api/types.ts`에 필요한 타입을 추가합니다:

```typescript
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}
```

### 3. 서비스 함수 작성

`src/api/services/` 폴더에 새로운 서비스 파일을 생성하거나 기존 파일에 추가합니다:

```typescript
// src/api/services/userService.ts
import apiClient from '../client'
import { User, CreateUserRequest, ApiResponse } from '../types'
import { API_ENDPOINTS, replaceParams } from '../endpoints'

export const userService = {
  // 사용자 목록 조회
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USERS.LIST
    )
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '사용자 목록을 가져오는데 실패했습니다.')
  },

  // 사용자 상세 조회
  getUser: async (id: string): Promise<User> => {
    const endpoint = replaceParams(API_ENDPOINTS.USERS.DETAIL, { id })
    const response = await apiClient.get<ApiResponse<User>>(endpoint)
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '사용자 정보를 가져오는데 실패했습니다.')
  },

  // 사용자 생성
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.CREATE,
      data
    )
    
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || '사용자 생성에 실패했습니다.')
  },
}
```

### 4. Export 추가

`src/api/index.ts`에 새로운 서비스를 export합니다:

```typescript
export { userService } from './services/userService'
```

## 🔧 React Query와 함께 사용하기

React Query를 사용하여 API 호출을 관리하는 것을 권장합니다:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/api'

// Query 사용 (GET 요청)
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  })

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생: {error.message}</div>

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

// Mutation 사용 (POST, PUT, DELETE 요청)
function CreateUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      // 성공 시 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name: 'John',
      email: 'john@example.com',
      password: 'password123'
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '생성 중...' : '사용자 생성'}
      </button>
    </form>
  )
}
```

## 🔐 인증 토큰 관리

인증 토큰은 자동으로 요청 헤더에 추가됩니다. 토큰은 `localStorage`에 저장되며, 로그인 시 자동으로 저장되고 로그아웃 시 제거됩니다.

### 수동으로 토큰 설정하기

```typescript
localStorage.setItem('authToken', 'your-token-here')
```

### 토큰 제거하기

```typescript
localStorage.removeItem('authToken')
```

## ⚠️ 에러 처리

API 클라이언트는 자동으로 에러를 처리합니다:

- **401 Unauthorized**: 토큰이 만료되면 자동으로 로그아웃 처리 후 로그인 페이지로 리다이렉트
- **403 Forbidden**: 접근 권한 없음 에러
- **404 Not Found**: 리소스를 찾을 수 없음
- **500 Internal Server Error**: 서버 오류
- **Network Error**: 네트워크 연결 오류

에러는 `ApiError` 타입으로 반환됩니다:

```typescript
try {
  await userService.getUsers()
} catch (error) {
  if (error instanceof Error) {
    console.error('에러 메시지:', error.message)
    // error.status로 HTTP 상태 코드 확인 가능
  }
}
```

## 🛠️ 개발 환경 설정

개발 환경에서는 모든 API 요청과 응답이 콘솔에 로깅됩니다. 프로덕션 환경에서는 자동으로 비활성화됩니다.

## 📚 추가 리소스

- [Axios 공식 문서](https://axios-http.com/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

## 💡 팁

1. **서비스 함수 사용 권장**: 직접 `apiClient`를 사용하는 대신 서비스 함수를 사용하면 타입 안정성과 재사용성이 향상됩니다.

2. **React Query 활용**: 서버 상태 관리를 위해 React Query를 적극 활용하세요.

3. **타입 정의**: 모든 API 요청/응답에 타입을 정의하여 타입 안정성을 확보하세요.

4. **에러 처리**: 모든 API 호출에 try-catch를 사용하여 에러를 적절히 처리하세요.

5. **환경 변수**: API Base URL은 환경 변수로 관리하여 개발/프로덕션 환경을 쉽게 전환할 수 있도록 하세요.
