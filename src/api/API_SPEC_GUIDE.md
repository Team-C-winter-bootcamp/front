# API 명세서 처리 가이드

이 문서는 새로운 API 명세서를 받았을 때 프로젝트에 반영하는 방법을 단계별로 설명합니다.

## 📋 처리 단계

### 1단계: 명세서 분석

명세서를 받으면 다음 정보를 확인합니다:

- ✅ **엔드포인트 경로**: `/users/signup` 같은 URL 경로
- ✅ **HTTP Method**: GET, POST, PUT, DELETE 등
- ✅ **Request Parameters**: 
  - Query Parameters (URL에 포함)
  - Path Parameters (URL 경로에 포함, 예: `/users/:id`)
  - Request Body (POST/PUT 요청의 본문)
- ✅ **Response Format**: 성공 응답 구조
- ✅ **Error Response Format**: 에러 응답 구조 및 에러 코드
- ✅ **HTTP Status Codes**: 200, 400, 404, 500 등

### 2단계: 엔드포인트 상수 추가/수정

`src/api/endpoints.ts` 파일에 엔드포인트를 추가하거나 수정합니다.

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/users/signup', // 명세서에 따라 추가/수정
  },
} as const
```

**주의사항:**
- 기존 엔드포인트와 중복되지 않는지 확인
- 경로 파라미터가 있으면 `:id` 형식으로 표기 (예: `/users/:id`)

### 3단계: 타입 정의 추가/수정

`src/api/types.ts` 파일에 필요한 타입을 추가합니다.

#### Request 타입 정의

```typescript
// 명세서의 Request Body에 맞춰 타입 정의
export interface SignupRequest {
  username: string  // 필수 필드
  password: string  // 필수 필드
  email: string     // 필수 필드
}
```

#### Response 타입 정의

```typescript
// 명세서의 성공 응답에 맞춰 타입 정의
export interface SignupResponse {
  message: string
  user: {
    username: string
    email: string
  }
}
```

#### Error Response 타입 정의

```typescript
// 명세서의 에러 응답 구조에 맞춰 타입 정의
export interface ApiErrorResponse {
  error_code: string
  message: string
  detail?: Record<string, string[]>  // 필드별 에러 메시지
}

// 에러 코드 상수 (선택사항)
export const ERROR_CODES = {
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
} as const
```

### 4단계: 서비스 함수 작성/수정

`src/api/services/` 폴더에 서비스 함수를 작성합니다.

#### 기본 구조

```typescript
import apiClient from '../client'
import { SignupRequest, SignupResponse, ApiErrorResponse } from '../types'
import { API_ENDPOINTS } from '../endpoints'

export const authService = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await apiClient.post<SignupResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        data
      )
      
      return response.data
    } catch (error: any) {
      // 에러 응답 처리
      if (error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse
        
        // 에러 코드별 처리
        switch (errorData.error_code) {
          case 'DUPLICATE_RESOURCE':
            throw new Error(
              errorData.detail 
                ? Object.values(errorData.detail).flat().join(', ')
                : errorData.message
            )
          // ... 다른 에러 코드 처리
        }
      }
      
      throw error
    }
  },
}
```

#### 주의사항

1. **응답 구조 확인**: 
   - 명세서에 `{ message, user }` 형태로 직접 반환되면 `ApiResponse<T>` 래퍼 없이 직접 타입 사용
   - `{ success, data }` 형태로 래핑되어 있으면 `ApiResponse<T>` 사용

2. **에러 처리**:
   - 명세서에 명시된 에러 코드별로 적절한 에러 메시지 반환
   - `detail` 필드가 있으면 필드별 에러 메시지 결합

3. **타입 안정성**:
   - 모든 요청/응답에 타입 지정
   - `any` 타입 사용 최소화

### 5단계: Export 추가

`src/api/index.ts` 파일에 새로운 서비스를 export합니다.

```typescript
export { authService } from './services/authService'
```

### 6단계: 사용 예시 작성

컴포넌트나 훅에서 사용할 수 있도록 예시를 작성합니다.

#### React Query와 함께 사용

```typescript
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/api'

function SignupForm() {
  const mutation = useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (data) => {
      console.log('회원가입 성공:', data.message)
      // 성공 처리
    },
    onError: (error: Error) => {
      console.error('회원가입 실패:', error.message)
      // 에러 처리
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate({
      username: 'lawyer_kim',
      password: 'SecretPassword123!',
      email: 'kim@example.com',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '가입 중...' : '회원가입'}
      </button>
    </form>
  )
}
```

## 🔍 명세서 분석 체크리스트

명세서를 받았을 때 다음 항목들을 확인하세요:

- [ ] 엔드포인트 경로가 정확한가?
- [ ] HTTP Method가 명시되어 있는가?
- [ ] Request Body의 필드명과 타입이 명확한가?
- [ ] 필수/선택 필드가 구분되어 있는가?
- [ ] 성공 응답 구조가 명확한가?
- [ ] 에러 응답 구조와 에러 코드가 명시되어 있는가?
- [ ] HTTP Status Code가 명시되어 있는가?
- [ ] 기존 API와 충돌이 없는가?

## 📝 실제 적용 예시: 회원가입 API

### 명세서 정보

```
Endpoint: /users/signup
Method: POST
Request Body: { username, password, email }
Response: { message, user: { username, email } }
Error Codes: DUPLICATE_RESOURCE, VALIDATION_FAILED, FIELD_REQUIRED
```

### 적용 결과

1. ✅ `endpoints.ts`: `SIGNUP: '/users/signup'` 추가
2. ✅ `types.ts`: `SignupRequest`, `SignupResponse`, `ApiErrorResponse` 타입 정의
3. ✅ `authService.ts`: `signup` 함수 구현 및 에러 처리
4. ✅ `client.ts`: 400, 403 에러 응답 처리 개선
5. ✅ `index.ts`: export 확인

## 🚨 주의사항

1. **기존 코드와의 호환성**: 기존 API를 수정할 때는 다른 곳에서 사용하는지 확인
2. **타입 일관성**: 명세서의 필드명과 타입 정의가 정확히 일치해야 함
3. **에러 처리**: 모든 에러 케이스를 처리하도록 구현
4. **테스트**: 실제 API와 연동하여 테스트 필수

## 💡 팁

1. **명세서가 불명확할 때**: 백엔드 개발자에게 명확히 확인
2. **응답 구조가 다를 때**: 실제 API 응답을 확인하여 타입 조정
3. **에러 코드가 많을 때**: 에러 코드 상수를 별도 파일로 관리
4. **재사용성**: 비슷한 API 패턴이 있으면 공통 함수로 추출
