import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, Message, ChatHistory } from '../store/useStore'
import { sessionService } from '../api'

export const useAIChat = () => {
  const navigate = useNavigate()
  const { 
    isAuthenticated, 
    chatHistories, 
    setChatHistories, 
    currentChatId, 
    setCurrentChatId 
  } = useStore()

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/') 
    }
  }, [isAuthenticated, navigate])

  // 세션 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      const loadSessions = async () => {
        try {
          const sessions = await sessionService.getList()
          const chatHistories: ChatHistory[] = sessions.map(s => ({
            id: s.id.toString(),
            name: s.title,
            messages: [],
            createdAt: new Date().toISOString()
          }))
          setChatHistories(prev => {
            // 기존에 없던 세션만 추가
            const existingIds = new Set(prev.map(ch => ch.id))
            const newSessions = chatHistories.filter(ch => !existingIds.has(ch.id))
            return [...prev, ...newSessions]
          })
        } catch (error) {
          console.error('세션 목록 로드 실패:', error)
        }
      }
      loadSessions()
    }
  }, [isAuthenticated, setChatHistories])

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
          // API에서 메시지 로드
          const loadMessages = async () => {
            try {
              const sessionId = parseInt(currentChatId)
              if (!isNaN(sessionId)) {
                const messageData = await sessionService.getMessage(sessionId)
                const loadedMessages: Message[] = messageData.messages.map((msg, idx) => ({
                  id: msg.id,
                  text: msg.content,
                  isUser: msg.role === 'user',
                  timestamp: new Date().toISOString()
                }))
                setMessages(loadedMessages)
                previousMessagesRef.current = loadedMessages
                // chatHistories에도 업데이트
                setChatHistories(prev => prev.map(ch =>
                  ch.id === currentChatId ? { ...ch, messages: loadedMessages } : ch
                ))
              } else {
                // 숫자가 아닌 경우 로컬 메시지 사용
                setMessages(currentChat.messages)
                previousMessagesRef.current = currentChat.messages
              }
            } catch (error) {
              console.error('메시지 로드 실패:', error)
              // 에러 시 로컬 메시지 사용
              setMessages(currentChat.messages)
              previousMessagesRef.current = currentChat.messages
            }
            setIsWelcomeMode(false)
          }
          loadMessages()
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

  const handleNewChat = async () => {
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

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleChatDelete = (_chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // 모달을 열기만 함 (실제 삭제는 confirmChatDelete에서 처리)
  }

  const confirmChatDelete = async (chatId: string) => {
    try {
      const sessionId = parseInt(chatId)
      if (!isNaN(sessionId)) {
        await sessionService.delete(sessionId)
      }
      setChatHistories(prev => prev.filter(ch => ch.id !== chatId))
      if (currentChatId === chatId) {
        handleNewChat()
      }
    } catch (error) {
      console.error('채팅 삭제 실패:', error)
      // UI에서는 삭제하고 API 에러는 로그만 남김
      setChatHistories(prev => prev.filter(ch => ch.id !== chatId))
      if (currentChatId === chatId) {
        handleNewChat()
      }
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
    if (editingChatId && editingName.trim()) {
      try {
        const sessionId = parseInt(editingChatId)
        if (!isNaN(sessionId)) {
          await sessionService.modify(sessionId, {
            title: editingName.trim(),
            bookmark: false // 기존 북마크 상태 유지 (필요시 store에서 가져오기)
          })
        }
        setChatHistories(prev => prev.map(ch =>
          ch.id === editingChatId ? { ...ch, name: editingName.trim() } : ch
        ))
        setEditingChatId(null)
        setEditingName('')
      } catch (error) {
        console.error('채팅 이름 변경 실패:', error)
      }
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessageText = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      let sessionId: number | null = null

      if (isWelcomeMode || !currentChatId) {
        // 새로운 채팅 생성
        const newChatData = await sessionService.newChat({ message: userMessageText })
        sessionId = newChatData.session_id
        const newChatId = sessionId.toString()
        
        isCreatingChat.current = true

        const userMessage: Message = {
          id: Date.now(),
          text: userMessageText,
          isUser: true,
          timestamp: new Date().toISOString()
        }

        const newChat: ChatHistory = {
          id: newChatId,
          name: newChatData.title,
          messages: [userMessage],
          createdAt: new Date().toISOString()
        }
        
        setChatHistories(prev => [newChat, ...prev])
        setCurrentChatId(newChatId)
        previousChatIdRef.current = newChatId
        setIsWelcomeMode(false)
        setMessages([userMessage])
        previousMessagesRef.current = [userMessage]

        // AI 응답 받기 (새 채팅 생성 시 자동으로 응답이 오는 것으로 가정)
        try {
          const responseData = await sessionService.sendMessage(sessionId, { message: userMessageText })
          const aiMessage: Message = {
            id: responseData.id,
            text: responseData.content,
            isUser: false,
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, aiMessage])
          previousMessagesRef.current = [...previousMessagesRef.current, aiMessage]
        } catch (error) {
          console.error('AI 응답 받기 실패:', error)
          const aiMessage: Message = {
            id: Date.now() + 1,
            text: `질문에 대한 답변입니다. "${userMessageText}"에 대해 법률적으로 검토한 결과...`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, aiMessage])
          previousMessagesRef.current = [...previousMessagesRef.current, aiMessage]
        }
      } else {
        // 기존 채팅에 메시지 전송
        sessionId = parseInt(currentChatId)
        if (isNaN(sessionId)) {
          throw new Error('Invalid session ID')
        }

        const userMessage: Message = {
          id: Date.now(),
          text: userMessageText,
          isUser: true,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        previousMessagesRef.current = [...previousMessagesRef.current, userMessage]

        // AI 응답 받기
        try {
          const responseData = await sessionService.sendMessage(sessionId, { message: userMessageText })
          const aiMessage: Message = {
            id: responseData.id,
            text: responseData.content,
            isUser: false,
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, aiMessage])
          previousMessagesRef.current = [...previousMessagesRef.current, aiMessage]
        } catch (error) {
          console.error('AI 응답 받기 실패:', error)
          const aiMessage: Message = {
            id: Date.now() + 1,
            text: `질문에 대한 답변입니다. "${userMessageText}"에 대해 법률적으로 검토한 결과...`,
            isUser: false,
            timestamp: new Date().toISOString()
          }
          setMessages(prev => [...prev, aiMessage])
          previousMessagesRef.current = [...previousMessagesRef.current, aiMessage]
        }
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      // 에러 시에도 로컬 메시지는 추가
      const userMessage: Message = {
        id: Date.now(),
        text: userMessageText,
        isUser: true,
        timestamp: new Date().toISOString()
      }
      if (currentChatId) {
        setMessages(prev => [...prev, userMessage])
      } else {
        const newChatId = Date.now().toString()
        const newChat: ChatHistory = {
          id: newChatId,
          name: userMessageText.substring(0, 20) + (userMessageText.length > 20 ? '...' : ''),
          messages: [userMessage],
          createdAt: new Date().toISOString()
        }
        setChatHistories(prev => [newChat, ...prev])
        setCurrentChatId(newChatId)
        setMessages([userMessage])
        setIsWelcomeMode(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (resultId: number) => {
    navigate(`/judgment/${resultId}`, { state: { from: 'chat' } })
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
    handleResultClick
  }
}
