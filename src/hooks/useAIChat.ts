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

    if (currentChatId) {
      const currentChat = chatHistories.find(ch => ch.id === currentChatId)
      if (currentChat) {
        setMessages(currentChat.messages)
        setIsWelcomeMode(false)
      } else {
        setIsWelcomeMode(true)
        setMessages([])
      }
    } else {
      setIsWelcomeMode(true)
      setMessages([])
    }
  }, [currentChatId, chatHistories])

  useEffect(() => {
    if (!isWelcomeMode) {
      scrollToBottom()
    }
  }, [messages, isWelcomeMode])

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: messages } 
          : chat
      ))
    }
  }, [messages, currentChatId, setChatHistories])

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setIsWelcomeMode(true)
    setInput('')
    isCreatingChat.current = false
  }

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleChatDelete = (chatId: string, e: React.MouseEvent) => {
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
      setIsWelcomeMode(false)
      setMessages([userMessage]) 
    } else {
      setMessages(prev => [...prev, userMessage])
    }

    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: `질문에 대한 답변입니다. "${userMessage.text}"에 대해 법률적으로 검토한 결과...`,
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
