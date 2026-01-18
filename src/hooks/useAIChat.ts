import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, Message, ChatHistory } from '../store/useStore'

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

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleChatDelete = (_chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // 모달을 열기만 함 (실제 삭제는 confirmChatDelete에서 처리)
  }

  const confirmChatDelete = (chatId: string) => {
    setChatHistories(prev => prev.filter(ch => ch.id !== chatId))
    if (currentChatId === chatId) {
      handleNewChat()
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

  const handleRenameSave = () => {
    if (editingChatId && editingName.trim()) {
      setChatHistories(prev => prev.map(ch =>
        ch.id === editingChatId ? { ...ch, name: editingName.trim() } : ch
      ))
      setEditingChatId(null)
      setEditingName('')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    if (isWelcomeMode || !currentChatId) {
      // 새로운 채팅을 생성하기 전에, 이전에 다른 채팅이 있었다면 그 메시지를 저장
      // (이미 handleNewChat에서 저장했지만, 안전을 위해 확인)
      const newChatId = Date.now().toString()
      
      isCreatingChat.current = true

      const newChat: ChatHistory = {
        id: newChatId,
        name: input.substring(0, 20) + (input.length > 20 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date().toISOString()
      }
      
      setChatHistories(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
      previousChatIdRef.current = newChatId
      setIsWelcomeMode(false)
      setMessages([userMessage])
      previousMessagesRef.current = [userMessage]
    } else {
      // 기존 채팅에 메시지 추가
      setMessages(prev => [...prev, userMessage])
    }

    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: `질문에 대한 답변입니다. "${userMessage.text}"과 관련된 법례는 다음과 같습니다.`,
        isUser: false,
        timestamp: new Date().toISOString(),
        resultId: Math.floor(Math.random() * 100)
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
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
