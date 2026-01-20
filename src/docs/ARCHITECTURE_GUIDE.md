# React 프론트엔드 아키텍처 가이드

## 📐 구조 개요

이 프로젝트는 **api → hooks → pages/components** 구조를 따릅니다.

```
src/
├── api/              # API 서비스 레이어
│   ├── client.ts     # Axios 인스턴스 및 인터셉터
│   ├── endpoints.ts  # API 엔드포인트 상수
│   ├── types.ts      # TypeScript 타입 정의
│   └── services/     # 기능별 API 서비스 함수
│       └── Service.ts
│
├── hooks/            # React Query 기반 Custom Hooks
│   ├── useSessions.ts         # 채팅 목록 관련 hooks
│   └── useSessionMessages.ts  # 메시지 관련 hooks
│
├── pages/            # 페이지 컴포넌트
└── components/       # 재사용 가능한 컴포넌트
```

## 🔑 session_id 관리

### 저장 위치 및 방법

**session_id는 `localStorage`에 저장**합니다.

```typescript
// src/utils/sessionStorage.ts
localStorage.setItem('session_id', sessionId)
```

### 관리 위치

1. **로그인 시**: `LoginPage` 또는 로그인 처리 함수에서 session_id 저장
2. **API 요청 시**: `api/client.ts`의 인터셉터에서 자동으로 헤더에 포함
3. **로그아웃 시**: `useStore`의 `logout` 함수에서 제거

### 왜 localStorage인가?

- ✅ **간단함**: 별도의 상태 관리 라이브러리 불필요
- ✅ **영속성**: 새로고침 후에도 유지
- ✅ **보안**: 서버에서 session_id → user_id로 매핑하므로 프론트에서는 단순 저장만 필요
- ⚠️ **주의**: XSS 공격에 취약할 수 있으므로, 민감한 정보는 저장하지 않음

### 대안: 쿠키 사용

만약 서버에서 쿠키로 session_id를 관리한다면:

```typescript
// 쿠키로 자동 전송되므로 별도 처리 불필요
// 단, httpOnly 쿠키는 JavaScript에서 접근 불가
```

## 🔄 데이터 흐름

### 1. API 레이어 (api/)

**역할**: 서버와의 통신만 담당

```typescript
// src/api/services/Service.ts
export const sessionService = {
  getList: async (): Promise<GETLISTData[]> => {
    const response = await apiClient.get<ApiResponse<GETLISTData[]>>(
      API_ENDPOINTS.session.GETLIST
    )
    return response.data.data || []
  },
}
```

### 2. Hooks 레이어 (hooks/)

**역할**: React Query를 사용하여 데이터 fetching, caching, 상태 관리

```typescript
// src/hooks/useSessions.ts
export const useSessions = () => {
  const currentSessionId = getSessionId()
  
  return useQuery({
    queryKey: sessionKeys.list(currentSessionId), // session_id 포함
    queryFn: () => sessionService.getList(),
    enabled: !!currentSessionId,
  })
}
```

**핵심 포인트**:
- `queryKey`에 `session_id`를 포함하여 **user별 캐시 분리**
- `enabled` 옵션으로 session_id가 있을 때만 요청

### 3. 컴포넌트 레이어 (pages/components)

**역할**: UI 렌더링 및 사용자 인터랙션

```typescript
// 컴포넌트에서 사용
const { data: sessions } = useSessions()
const toggleBookmark = useToggleBookmark()
```

## 👤 User별 데이터 분리

### 서버 측 처리

서버에서 `session_id → user_id`로 매핑하여 처리하므로, 프론트에서는 **session_id만 관리**하면 됩니다.

### 프론트 측 처리

React Query의 `queryKey`에 `session_id`를 포함하여 캐시를 분리합니다:

```typescript
// session_id별로 다른 캐시 키 생성
queryKey: ['sessions', 'list', sessionId]

// user1 (sessionId: 'abc') → ['sessions', 'list', 'abc']
// user2 (sessionId: 'xyz') → ['sessions', 'list', 'xyz']
```

이렇게 하면:
- ✅ 각 사용자의 데이터가 독립적으로 캐싱됨
- ✅ 사용자 전환 시 자동으로 올바른 데이터 조회
- ✅ 캐시 무효화도 user별로 처리 가능

## 📚 React Query 사용 패턴

### Query (데이터 조회)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiService.getData(),
})
```

### Mutation (데이터 변경)

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiService.updateData(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] })
  },
})

// 사용
mutation.mutate(newData)
```

### Optimistic Update (즉시 UI 업데이트)

```typescript
const toggleBookmark = useMutation({
  mutationFn: async ({ sessionId, currentBookmark }) => {
    // 1. 즉시 UI 업데이트
    queryClient.setQueryData(['sessions'], (old) => {
      return old.map(s => 
        s.id === sessionId ? { ...s, bookmark: !currentBookmark } : s
      )
    })
    
    // 2. 서버에 요청
    return sessionService.modify(sessionId, { bookmark: !currentBookmark })
  },
  onError: (_, variables) => {
    // 3. 에러 시 롤백
    queryClient.setQueryData(['sessions'], (old) => {
      return old.map(s => 
        s.id === variables.sessionId 
          ? { ...s, bookmark: variables.currentBookmark } 
          : s
      )
    })
  },
})
```

## 🔖 북마크 기능 구현

### API 연동

```typescript
// 북마크 토글
const toggleBookmark = useToggleBookmark()

toggleBookmark.mutate(
  { sessionId: 1, currentBookmark: false },
  {
    onSuccess: () => {
      // 성공 처리
    },
    onError: (error) => {
      // 에러 처리
    },
  }
)
```

### UI에서 사용

```typescript
// 북마크된 항목 먼저 표시
const sortedSessions = sessions.sort((a, b) => {
  if (a.bookmark !== b.bookmark) {
    return a.bookmark ? -1 : 1
  }
  return b.id - a.id // 최신순
})
```

## 📝 예시 코드

### 채팅 목록 조회 및 북마크 토글

```typescript
import { useSessions, useToggleBookmark } from '@/hooks/useSessions'

function ChatList() {
  const { data: sessions, isLoading } = useSessions()
  const toggleBookmark = useToggleBookmark()

  const handleToggle = (sessionId: number, currentBookmark: boolean) => {
    toggleBookmark.mutate({ sessionId, currentBookmark })
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div>
      {sessions?.map(session => (
        <div key={session.id}>
          <h3>{session.title}</h3>
          <button onClick={() => handleToggle(session.id, session.bookmark)}>
            {session.bookmark ? '⭐' : '☆'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 메시지 조회 및 전송

```typescript
import { useSessionMessages, useSendMessage } from '@/hooks/useSessionMessages'

function ChatRoom({ sessionId }: { sessionId: number }) {
  const { data: messages } = useSessionMessages(sessionId)
  const sendMessage = useSendMessage()

  const handleSend = (text: string) => {
    sendMessage.mutate(
      { sessionId, data: { message: text } },
      { onSuccess: () => console.log('전송 완료') }
    )
  }

  return (
    <div>
      {messages?.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => handleSend('안녕하세요')}>
        전송
      </button>
    </div>
  )
}
```

## 🎯 Best Practices

1. **Query Key 관리**
   - `sessionKeys` 객체로 중앙 관리
   - session_id를 항상 포함하여 user별 분리

2. **에러 처리**
   - 모든 mutation에 `onError` 핸들러 추가
   - 사용자에게 적절한 에러 메시지 표시

3. **로딩 상태**
   - `isLoading`, `isPending` 상태 활용
   - 사용자 경험을 위한 로딩 UI 제공

4. **캐시 무효화**
   - 데이터 변경 후 관련 query 무효화
   - `invalidateQueries`로 최신 데이터 보장

5. **타입 안정성**
   - 모든 API 응답에 타입 정의
   - TypeScript로 컴파일 타임 에러 방지

## 🔐 보안 고려사항

1. **session_id 보안**
   - localStorage는 XSS에 취약하므로, 가능하면 httpOnly 쿠키 사용 권장
   - 현재는 서버에서 session_id → user_id 매핑하므로 상대적으로 안전

2. **API 요청**
   - 모든 요청에 session_id 자동 포함 (인터셉터)
   - 401 에러 시 자동 로그아웃 처리

3. **데이터 검증**
   - 서버 응답 데이터 타입 검증
   - 에러 응답 처리
