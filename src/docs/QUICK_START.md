# 빠른 시작 가이드

## 🚀 React Query 기반 API 연동 빠른 가이드

### 1. session_id 관리

#### 로그인 시 session_id 저장

```typescript
import { setSessionId } from '@/utils/sessionStorage'
import { useStore } from '@/store/useStore'

// 로그인 성공 후
const response = await loginAPI({ email, password })
setSessionId(response.session_id) // localStorage에 저장

// Zustand store에도 저장 (선택사항)
const { login } = useStore()
login(email, email, response.session_id)
```

#### 로그아웃 시 session_id 제거

```typescript
import { removeSessionId } from '@/utils/sessionStorage'
import { useStore } from '@/store/useStore'

const { logout } = useStore()
logout() // 내부에서 removeSessionId() 호출됨
```

### 2. 채팅 목록 조회

```typescript
import { useSessions } from '@/hooks'

function ChatListPage() {
  const { data: sessions, isLoading, error } = useSessions()

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error.message}</div>

  return (
    <div>
      {sessions?.map(session => (
        <div key={session.id}>{session.title}</div>
      ))}
    </div>
  )
}
```

### 3. 북마크 토글

```typescript
import { useSessions, useToggleBookmark } from '@/hooks'

function ChatListPage() {
  const { data: sessions } = useSessions()
  const toggleBookmark = useToggleBookmark()

  const handleToggle = (sessionId: number, currentBookmark: boolean) => {
    toggleBookmark.mutate(
      { sessionId, currentBookmark },
      {
        onSuccess: () => {
          console.log('북마크 토글 성공')
        },
        onError: (error) => {
          console.error('북마크 토글 실패:', error)
        },
      }
    )
  }

  return (
    <div>
      {sessions?.map(session => (
        <div key={session.id}>
          <span>{session.title}</span>
          <button
            onClick={() => handleToggle(session.id, session.bookmark)}
            disabled={toggleBookmark.isPending}
          >
            {session.bookmark ? '⭐' : '☆'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 4. 메시지 조회 및 전송

```typescript
import { useSessionMessages, useSendMessage } from '@/hooks'

function ChatRoom({ sessionId }: { sessionId: number }) {
  const { data: messageData, isLoading } = useSessionMessages(sessionId)
  const sendMessage = useSendMessage()
  const [input, setInput] = useState('')

  const handleSend = () => {
    sendMessage.mutate(
      { sessionId, data: { message: input } },
      {
        onSuccess: () => {
          setInput('') // 입력 필드 초기화
        },
      }
    )
  }

  if (isLoading) return <div>메시지 로딩 중...</div>

  return (
    <div>
      {/* 메시지 목록 */}
      {messageData?.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}

      {/* 입력 폼 */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={sendMessage.isPending}>
        전송
      </button>
    </div>
  )
}
```

### 5. 새 채팅 생성

```typescript
import { useCreateSession } from '@/hooks'

function NewChatButton() {
  const createSession = useCreateSession()

  const handleNewChat = () => {
    createSession.mutate('안녕하세요', {
      onSuccess: (data) => {
        console.log('새 채팅 생성:', data.session_id)
        // 채팅방으로 이동
        navigate(`/chat/${data.session_id}`)
      },
    })
  }

  return (
    <button onClick={handleNewChat} disabled={createSession.isPending}>
      {createSession.isPending ? '생성 중...' : '새 채팅'}
    </button>
  )
}
```

## 📋 주요 Hook 목록

### Session 관련
- `useSessions()` - 채팅 목록 조회
- `useCreateSession()` - 새 채팅 생성
- `useUpdateSession()` - 채팅방 수정 (제목, 북마크)
- `useDeleteSession()` - 채팅방 삭제
- `useToggleBookmark()` - 북마크 토글

### Message 관련
- `useSessionMessages(sessionId)` - 메시지 목록 조회
- `useSendMessage()` - 메시지 전송
- `useModifyMessage()` - 메시지 수정

## 🔑 session_id 관리 위치

### 저장 위치
- **localStorage**: `session_id` 키로 저장
- **유틸리티**: `src/utils/sessionStorage.ts`

### 자동 포함
- **API 요청**: `src/api/client.ts`의 인터셉터에서 자동으로 헤더에 포함
- **헤더 이름**: `X-Session-Id` (서버 요구사항에 따라 변경 가능)

### User별 데이터 분리
- React Query의 `queryKey`에 `session_id` 포함
- 각 사용자별로 독립적인 캐시 관리
- 자동으로 올바른 데이터 조회

## 💡 Best Practices

1. **항상 session_id 확인**
   ```typescript
   const sessionId = getSessionId()
   if (!sessionId) {
     navigate('/login')
     return
   }
   ```

2. **에러 처리**
   ```typescript
   const mutation = useMutation({
     mutationFn: ...,
     onError: (error) => {
       // 사용자에게 에러 메시지 표시
       toast.error(error.message)
     },
   })
   ```

3. **로딩 상태 표시**
   ```typescript
   if (isLoading) return <LoadingSpinner />
   if (error) return <ErrorMessage error={error} />
   ```

4. **Optimistic Update 활용**
   - `useToggleBookmark`에서 이미 구현됨
   - 즉시 UI 업데이트 후 서버 동기화

## 📚 더 자세한 내용

- [아키텍처 가이드](./ARCHITECTURE_GUIDE.md) - 전체 구조 설명
- [예시 컴포넌트](../components/examples/) - 실제 사용 예시
