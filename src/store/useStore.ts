import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 메모 타입
interface Memo {
  id: string
  title: string
  content: string
}

// 채팅 관련 타입 (export 필수임 AIChatPage에서 사용)
export interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: string // 시간(Date)은 저장 시 꼬일 수 있어 string(ISO) 권장
  resultId?: number
}

export interface ChatHistory {
  id: string
  name: string
  messages: Message[]
  createdAt: string
  isPinned?: boolean // [추가] 고정 여부 속성
}

interface StoreState {
  // --- 인증 관련 ---
  user: { id: string; email: string } | null
  isAuthenticated: boolean
  login: (id: string, email: string) => void
  logout: () => void

  // --- 메모 관련 ---
  memos: Memo[]
  setMemos: (memos: Memo[]) => void
  updateMemo: (id: string, memo: Partial<Memo>) => void
  addMemo: (memo: Memo) => void
  deleteMemo: (id: string) => void

  // --- ai 채팅 관련 ---
  chatHistories: ChatHistory[]
  currentChatId: string | null
  // 함수형 업데이트((prev) => ...)를 지원하기 위한 타입 정의
  setChatHistories: (updater: (prev: ChatHistory[]) => ChatHistory[]) => void
  setCurrentChatId: (id: string | null) => void
  clearChatSession: () => void
  
  // [추가] 채팅방 고정 토글 함수
  toggleChatPin: (chatId: string) => void 
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      
      //  인증
      user: null,
      isAuthenticated: false,
      login: (id: string, email: string) => 
        set({ user: { id, email }, isAuthenticated: true }),
      
      // 로그아웃 시 인증 정보뿐만 아니라 현재 보고 있던 채팅방 ID도 초기화 (선택사항)
      logout: () => 
        set({ user: null, isAuthenticated: false, currentChatId: null }),

      //  메모
      memos: [],
      setMemos: (memos: Memo[]) => set({ memos }),
      updateMemo: (id: string, memo: Partial<Memo>) =>
        set((state) => ({
          memos: state.memos.map((m) => (m.id === id ? { ...m, ...memo } : m)),
        })),
      addMemo: (memo: Memo) => set((state) => ({ memos: [...state.memos, memo] })),
      deleteMemo: (id: string) =>
        set((state) => ({ memos: state.memos.filter((m) => m.id !== id) })),

      // 채팅 구현
      chatHistories: [],
      currentChatId: null,

      // 채팅 목록 업데이트 (함수형 업데이트 지원)
      setChatHistories: (updater) => 
        set((state) => ({ 
          chatHistories: updater(state.chatHistories) 
        })),
      
      // 현재 채팅방 ID 설정
      setCurrentChatId: (id) => set({ currentChatId: id }),
      
      // 채팅 세션 초기화 (필요시 사용)
      clearChatSession: () => set({ chatHistories: [], currentChatId: null }),

      // [추가] 고정 상태 토글 함수 구현
      toggleChatPin: (chatId) => set((state) => ({
        chatHistories: state.chatHistories.map((chat) =>
          chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
        ),
      })),
    }),
    {
      name: 'lawding-storage', // 저장소 이름 (하나로 통일)
      storage: createJSONStorage(() => localStorage),
      // 저장하고 싶은 상태만 골라서 적어줍니다. (여기 없으면 새로고침 시 날아감)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        memos: state.memos,
        // 채팅 관련 데이터도 저장되도록 추가
        chatHistories: state.chatHistories, 
        currentChatId: state.currentChatId, 
      }),
    }
  )
)