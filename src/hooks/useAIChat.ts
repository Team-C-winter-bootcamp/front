import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, Message, ChatHistory } from '../store/useStore'
import { useCreateSession, useSessions, useUpdateSession } from './useSessions'
import { useSendMessage } from './useSessionMessages'
import { SENDMESSAGEData } from '../api/types'
import { sessionService } from '../api'

export const useAIChat = () => {
  const navigate = useNavigate()
  const { 
    isAuthenticated, 
    chatHistories, 
    setChatHistories, 
    currentChatId, 
    setCurrentChatId,
    toggleChatPin
  } = useStore()

  // API hooks
  const createSession = useCreateSession()
  const sendMessage = useSendMessage()
  const updateSession = useUpdateSession()
  const { data: sessions } = useSessions()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWelcomeMode, setIsWelcomeMode] = useState(!currentChatId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isCreatingChat = useRef(false)
  const previousMessagesRef = useRef<Message[]>([])
  const previousChatIdRef = useRef<string | null>(null)
  const sessionIdMapRef = useRef<Map<string, number>>(new Map()) // 로컬 chatId -> 서버 sessionId 매핑

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/') 
    }
  }, [isAuthenticated, navigate])

  // 서버에서 채팅 목록을 가져와서 동기화
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const serverChatHistories: ChatHistory[] = sessions.map((session) => {
        const localChatId = Array.from(sessionIdMapRef.current.entries())
          .find(([_, serverId]) => serverId === session.id)?.[0] || Date.now().toString()
        
        // 매핑 저장
        sessionIdMapRef.current.set(localChatId, session.id)
        
        return {
          id: localChatId,
          name: session.title,
          messages: [], // 메시지는 별도로 로드
          createdAt: new Date().toISOString(),
          isPinned: session.bookmark
        }
      })
      
      // 기존 채팅과 병합 (중복 제거)
      setChatHistories(prev => {
        const merged = [...prev]
        serverChatHistories.forEach(serverChat => {
          // 서버 sessionId로 이미 존재하는 채팅인지 확인
          const serverSessionId = sessionIdMapRef.current.get(serverChat.id)
          const exists = merged.find(ch => {
            const mappedServerId = sessionIdMapRef.current.get(ch.id)
            return mappedServerId === serverSessionId && serverSessionId !== undefined
          })
          if (!exists) {
            merged.push(serverChat)
          } else {
            // 기존 채팅 정보 업데이트 (제목, 북마크 등)
            const index = merged.findIndex(ch => {
              const mappedServerId = sessionIdMapRef.current.get(ch.id)
              return mappedServerId === serverSessionId && serverSessionId !== undefined
            })
            if (index !== -1) {
              merged[index] = {
                ...merged[index],
                name: serverChat.name,
                isPinned: serverChat.isPinned
              }
            }
          }
        })
        return merged
      })
    }
  }, [sessions, setChatHistories])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isCreatingChat.current) {
      isCreatingChat.current = false
      return
    }

    // currentChatId가 변경되었을 때만 chatHistories에서 메시지 로드
    if (currentChatId !== previousChatIdRef.current) {
      previousChatIdRef.current = currentChatId
      
      if (currentChatId) {
        const currentChat = chatHistories.find(ch => ch.id === currentChatId)
        if (currentChat) {
          setMessages(currentChat.messages)
          previousMessagesRef.current = currentChat.messages
          setIsWelcomeMode(false)
        } else {
          setIsWelcomeMode(true)
          setMessages([])
          previousMessagesRef.current = []
        }
      } else {
        setIsWelcomeMode(true)
        setMessages([])
        previousMessagesRef.current = []
      }
    }
  }, [currentChatId, chatHistories])

  useEffect(() => {
    if (!isWelcomeMode) {
      scrollToBottom()
    }
  }, [messages, isWelcomeMode])

  // 메시지가 변경될 때마다 chatHistories에 저장
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      // 메시지가 실제로 변경되었을 때만 업데이트 (무한 루프 방지)
      const messagesChanged = 
        previousMessagesRef.current.length !== messages.length ||
        previousMessagesRef.current.some((msg, idx) => 
          msg.id !== messages[idx]?.id || msg.text !== messages[idx]?.text
        )
      
      if (messagesChanged) {
        setChatHistories(prev => {
          const existingChat = prev.find(chat => chat.id === currentChatId)
          if (existingChat) {
            return prev.map(chat => 
              chat.id === currentChatId 
                ? { ...chat, messages: [...messages] } 
                : chat
            )
          }
          return prev
        })
        previousMessagesRef.current = [...messages]
      }
    }
  }, [messages, currentChatId, setChatHistories])

  const handleNewChat = () => {
    // 현재 채팅의 메시지를 먼저 저장
    if (currentChatId && messages.length > 0) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...messages] } 
          : chat
      ))
    }
    
    setMessages([])
    previousMessagesRef.current = []
    setCurrentChatId(null)
    previousChatIdRef.current = null
    setIsWelcomeMode(true)
    setInput('')
    isCreatingChat.current = false
  }

  const handleChatClick = async (chatId: string) => {
    setCurrentChatId(chatId)
    
    // 서버 sessionId 찾기
    const serverSessionId = sessionIdMapRef.current.get(chatId)

if (serverSessionId) {
  try {
    const { sessionService } = await import('../api')
    const messageData = await sessionService.getMessage(serverSessionId)

    const rawMessages = Array.isArray(messageData)
      ? messageData
      : Array.isArray(messageData?.messages)
        ? messageData.messages
        : []

    if (rawMessages.length === 0) {
      console.warn('[useAIChat] 메시지 데이터가 없습니다:', messageData)
      setMessages([])
      previousMessagesRef.current = []
      setIsWelcomeMode(false)
      return
    }

    const loadedMessages: Message[] = rawMessages.map((msg) => ({
      id: msg.id,
      text: msg.content,
      isUser: msg.role === 'user',
      timestamp: new Date().toISOString(),
      resultId: msg.sender_id
    }))

    setMessages(loadedMessages)
    previousMessagesRef.current = loadedMessages
    setIsWelcomeMode(false)
  } catch (error) {
    console.error('[useAIChat] 메시지 로드 실패:', error)
  }
  return
}

  }

  const handleChatDelete = (_chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // 모달을 열기만 함 (실제 삭제는 confirmChatDelete에서 처리)
  }

  const confirmChatDelete = async (chatId: string) => {
    // ✅ 반드시 매핑에서 서버 sessionId 가져오기
    const serverSessionId = sessionIdMapRef.current.get(chatId)
  
    try {
      if (serverSessionId) {
        await sessionService.delete(serverSessionId)
      } else {
        console.warn('[useAIChat] 서버 sessionId를 찾을 수 없습니다:', chatId)
      }
    } catch (error) {
      console.error('[useAIChat] 채팅 삭제 실패:', error)
      // 서버 실패여도 UI는 삭제 (UX 우선)
    } finally {
      // ✅ UI 상태 정리
      setChatHistories(prev => prev.filter(ch => ch.id !== chatId))
  
      if (currentChatId === chatId) {
        handleNewChat()
      }
  
      // ✅ 매핑도 정리 (중요)
      sessionIdMapRef.current.delete(chatId)
    }
  }
  

  const handleChatRename = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const chat = chatHistories.find(ch => ch.id === chatId)
    if (chat) {
      setEditingChatId(chatId)
      setEditingName(chat.name)
    }
  }

  const handleRenameSave = async () => {
    if (!editingChatId || !editingName.trim()) return
  
    // ✅ 반드시 매핑에서 서버 sessionId 가져오기
    const serverSessionId = sessionIdMapRef.current.get(editingChatId)
  
    if (!serverSessionId) {
      console.warn('[useAIChat] 서버 sessionId를 찾을 수 없습니다:', editingChatId)
      return
    }

    const currentChat = chatHistories.find((ch) => ch.id === editingChatId)
    const currentBookmark = currentChat?.isPinned ?? false
  
    try {
      await updateSession.mutateAsync({
        sessionId: serverSessionId,
        data: {
          title: editingName.trim(),
          bookmark: currentBookmark,
        },
      })
  
      // ✅ 서버 성공 후 로컬 상태 업데이트
      setChatHistories(prev =>
        prev.map(ch =>
          ch.id === editingChatId
            ? { ...ch, name: editingName.trim() }
            : ch
        )
      )
  
      setEditingChatId(null)
      setEditingName('')
    } catch (error) {
      console.error('[useAIChat] 채팅 이름 변경 실패:', error)
      alert('채팅 이름 변경에 실패했습니다.')
    }
  }
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

 

    const messageText = input.trim()
    console.log('[useAIChat] 메시지 전송 시작:', messageText)
    
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setInput('')
    setIsLoading(true)

    try {
      if (isWelcomeMode || !currentChatId) {
        // 새로운 채팅 생성 (API 호출)
        console.log('[useAIChat] 새 채팅 생성:', messageText)
        
        createSession.mutate(messageText, {
          onSuccess: async (response) => {
            console.log('[useAIChat] 채팅 생성 성공:', response)
            
            const newChatId = Date.now().toString()
            const serverSessionId = response.session_id
            
            // 로컬 chatId와 서버 sessionId 매핑 저장
            sessionIdMapRef.current.set(newChatId, serverSessionId)
            
            isCreatingChat.current = true

            const newChat: ChatHistory = {
              id: newChatId,
              name: response.title || messageText.substring(0, 20) + (messageText.length > 20 ? '...' : ''),
              messages: [userMessage],
              createdAt: new Date().toISOString()
            }
            
            setChatHistories(prev => [newChat, ...prev])
            setCurrentChatId(newChatId)
            previousChatIdRef.current = newChatId
            setIsWelcomeMode(false)
            setMessages([userMessage])
            previousMessagesRef.current = [userMessage]

            // 메시지 전송 (AI 응답 받기)
            await sendMessageToServer(serverSessionId, messageText)
          },
          onError: (error) => {
            console.error('[useAIChat] 채팅 생성 실패:', error)
            setIsLoading(false)
            alert('채팅 생성에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
          }
        })
      } else {
        // 기존 채팅에 메시지 추가
        setMessages(prev => [...prev, userMessage])
        
        // 서버 sessionId 찾기
        const serverSessionId = sessionIdMapRef.current.get(currentChatId)
        
        if (serverSessionId) {
          // 메시지 전송 (AI 응답 받기)
          await sendMessageToServer(serverSessionId, messageText)
        } else {
          console.warn('[useAIChat] 서버 sessionId를 찾을 수 없습니다:', currentChatId)
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error('[useAIChat] 에러:', error)
      setIsLoading(false)
    }
  }

  const sendMessageToServer = async (serverSessionId: number, messageText: string) => {
    console.log('[useAIChat] 메시지 전송:', serverSessionId, messageText)
    
    sendMessage.mutate(
      { sessionId: serverSessionId, data: { message: messageText } },
      {
        onSuccess: (response: SENDMESSAGEData) => {
          console.log('[useAIChat] 메시지 전송 성공:', response)
          
          // AI 응답을 메시지로 추가
          const aiMessage: Message = {
            id: Date.now() + 1,
            text: response.content || `질문에 대한 답변입니다. "${messageText}"과 관련된 법례는 다음과 같습니다.`,
            isUser: false,
            timestamp: new Date().toISOString(),
            resultId: response.id
          }
          
          setMessages(prev => [...prev, aiMessage])
          setIsLoading(false)
        },
        onError: (error: Error) => {
          console.error('[useAIChat] 메시지 전송 실패:', error)
          
          // 에러 메시지 표시
          const errorMessage: Message = {
            id: Date.now() + 1,
            text: `메시지 전송에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, errorMessage])
          setIsLoading(false)
        }
      }
    )
  }

  const handleResultClick = (resultId: number) => {
    navigate(`/judgment/${resultId}`, { state: { from: 'chat' } })
  }

  // 북마크 토글 핸들러 (서버 API 호출 포함)
  const handleTogglePin = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 서버 sessionId 찾기
    const serverSessionId = sessionIdMapRef.current.get(chatId)
    
    if (serverSessionId) {
      // 현재 북마크 상태 확인
      const chat = chatHistories.find(ch => ch.id === chatId)
      const currentBookmark = chat?.isPinned || false
      
      // 로컬 UI 업데이트 (Optimistic Update)
      toggleChatPin(chatId)
      
      // 서버에 북마크 상태 업데이트 요청 (useUpdateSession hook 사용)
      console.log('[useAIChat] 북마크 토글 API 호출:', serverSessionId, !currentBookmark)
      updateSession.mutate(
        {
          sessionId: serverSessionId,
          data: {
            title: chat?.name || '',
            bookmark: !currentBookmark,
          },
        },
        {
          onSuccess: () => {
            console.log('[useAIChat] 북마크 토글 성공')
          },
          onError: (error) => {
            console.error('[useAIChat] 북마크 토글 실패:', error)
            // 실패 시 롤백
            toggleChatPin(chatId)
            alert('북마크 토글에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
          },
        }
      )
    } else {
      // 서버 sessionId가 없으면 로컬만 업데이트
      console.warn('[useAIChat] 서버 sessionId를 찾을 수 없습니다:', chatId)
      toggleChatPin(chatId)
    }
  }

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isWelcomeMode,
    messages,
    input,
    setInput,
    isLoading,
    editingChatId,
    editingName,
    setEditingName,
    messagesEndRef,
    chatHistories,
    currentChatId,
    handleNewChat,
    handleChatClick,
    handleChatDelete,
    confirmChatDelete,
    handleChatRename,
    handleRenameSave,
    handleSend,
    handleResultClick,
    handleTogglePin
  }
}
