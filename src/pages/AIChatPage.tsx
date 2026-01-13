import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, Message, ChatHistory } from '../store/useStore'
import Header from '../components/Header'

const AIChatPage = () => {
  const navigate = useNavigate()
  const { 
    isAuthenticated, 
    user, 
    chatHistories, 
    setChatHistories, 
    currentChatId, 
    setCurrentChatId 
  } = useStore()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWelcomeMode, setIsWelcomeMode] = useState(!currentChatId) // 채팅방이 선택되어 있으면 웰컴모드 끔
  const [messages, setMessages] = useState<Message[]>([]) // 현재 화면용 로컬 상태
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  // 페이지 들어왔을 때: 현재 선택된 채팅방이 있다면 그 메시지 불러오기
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chatHistories.find(ch => ch.id === currentChatId)
      if (currentChat) {
        setMessages(currentChat.messages)
        setIsWelcomeMode(false)
      } else {
        // ID는 있는데 실제 데이터가 없으면 초기화
        setIsWelcomeMode(true)
        setMessages([])
      }
    } else {
      setIsWelcomeMode(true)
      setMessages([])
    }
  }, [currentChatId]) // chatHistories는 제외 (무한루프 방지), ID가 바뀔 때만 실행

  // 메시지 스크롤 자동 이동
  useEffect(() => {
    if (!isWelcomeMode) {
      scrollToBottom()
    }
  }, [messages, isWelcomeMode])

  // 메시지가 변경되면 -> chatHistories에 자동 저장
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistories(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: messages } 
          : chat
      ))
    }
  }, [messages]) // currentChatId 제거 

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null) // 전역 상태 변경
    setIsWelcomeMode(true)
    setInput('')
  }

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId) // 전역 상태만 바꾸면 위의 useEffect가 알아서 메시지 로드함
  }

  const handleChatDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

    // 새 채팅 시작 로직
    if (isWelcomeMode || !currentChatId) {
      const newChatId = Date.now().toString()
      const newChat: ChatHistory = {
        id: newChatId,
        name: input.substring(0, 20) + (input.length > 20 ? '...' : ''),
        messages: [],
        createdAt: new Date().toISOString() // Date -> String 변환
      }
      
      // 순서 중요: 먼저 히스토리에 추가하고 -> ID를 설정
      setChatHistories(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
      setIsWelcomeMode(false)
      // 메시지 전송 로직이 useEffect 의존성 때문에 꼬일 수 있으므로 여기서 바로 처리하지 않고 return 후 다음 렌더링에 맡기거나
      // 로컬 메시지 업데이트를 진행합니다.
    }

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
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
    navigate(`/judgment/${resultId}`)
  }

  if (!isAuthenticated) {
    // navigate('/') 
  }

  return (
    <div className="h-screen bg-white flex flex-col text-gray-900 font-sans overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } flex-shrink-0 flex flex-col h-full`}
        >
          <div className="p-4 flex items-center justify-between flex-shrink-0">
            {!isSidebarCollapsed && (
              <button
                onClick={handleNewChat}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
              >
                <span>+</span>
                <span>새로운 채팅</span>
              </button>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors ${isSidebarCollapsed ? 'mx-auto' : 'ml-2'}`}
            >
              {isSidebarCollapsed ? '➜' : '☰'}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
              <div className="text-xs font-semibold text-gray-400 mb-3 px-2">최근 기록</div>
              <div className="space-y-1">
                {chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors text-sm flex items-center ${
                      currentChatId === chat.id 
                        ? 'bg-gray-200 text-black font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2 text-lg">💬</span>
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleRenameSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="truncate flex-1">{chat.name}</span>
                        <div className="hidden group-hover:flex gap-1 absolute right-2 bg-inherit pl-2">
                          <button onClick={(e) => handleChatRename(chat.id, e)} className="hover:text-blue-600">✏️</button>
                          <button onClick={(e) => handleChatDelete(chat.id, e)} className="hover:text-red-500">🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSidebarCollapsed && (
            <div className="p-2 flex flex-col items-center gap-4">
               <button onClick={handleNewChat} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm">
                 ➕
               </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          
          {isWelcomeMode ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20 overflow-y-auto">
              <div className="text-center max-w-2xl w-full">
                <div className="mb-8">
                  <span className="inline-block p-4 rounded-full bg-gray-100 mb-4 text-4xl">⚖️</span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    무엇을 도와드릴까요?
                  </h1>
                  <p className="text-gray-500">
                    Law딩중 AI가 판례 검색과 법률 조언을 도와드립니다.
                  </p>
                </div>
                
                <form onSubmit={handleSend} className="relative w-full shadow-lg rounded-2xl">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="예) 전세 보증금을 돌려받지 못하고 있어요..."
                    className="w-full p-5 pr-16 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-black text-white rounded-lg disabled:opacity-30 hover:bg-gray-800 transition-colors"
                  >
                    ➤
                  </button>
                </form>

                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {['📜 계약서 검토', '💰 임금 체불 상담', '🏠 부동산 분쟁', '🚗 교통사고 과실'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt)
                        setTimeout(() => {}, 0)
                      }}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm border ${
                        message.isUser ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-gray-200'
                      }`}>
                        {message.isUser ? '나' : 'AI'}
                      </div>

                      <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-base leading-relaxed ${
                        message.isUser 
                          ? 'bg-black text-white rounded-tr-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        
                        {!message.isUser && message.resultId && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleResultClick(message.resultId!)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                            >
                              📄 관련 판결문 분석 보기
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 text-sm">AI</div>
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                    placeholder="무엇이든 물어보세요..."
                    rows={1}
                    className="w-full pl-4 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white resize-none max-h-32 text-gray-900 placeholder-gray-400 shadow-sm"
                    style={{ minHeight: '56px' }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      input.trim() && !isLoading
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-400">AI의 답변은 부정확할 수 있으므로 중요 사안은 반드시 전문가와 상담하세요.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIChatPage