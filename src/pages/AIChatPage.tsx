import { useState } from 'react'
import Header from '../components/Header'
import DeleteAlertModal from '../components/AlertModal/DeleteAlertModal'
import { ChatSidebar } from '../components/ai-chat/ChatSidebar'
import { ChatMessage } from '../components/ai-chat/ChatMessage'
import { WelcomeScreen } from '../components/ai-chat/WelcomeScreen'
import { useAIChat } from '../hooks/useAIChat'

const AIChatPage = () => {
  const [deleteChatTargetId, setDeleteChatTargetId] = useState<string | null>(null)
  
  const {
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
    handleChatRename,
    handleRenameSave,
    handleSend,
    handleResultClick,
    confirmChatDelete
  } = useAIChat()

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    handleChatDelete(chatId, e)
    setDeleteChatTargetId(chatId)
  }

  const handleConfirmDelete = () => {
    if (deleteChatTargetId) {
      confirmChatDelete(deleteChatTargetId)
      setDeleteChatTargetId(null)
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col text-gray-900 font-sans overflow-hidden">
      <Header />
      
      {/* 삭제 확인 모달 */}
      <DeleteAlertModal 
        isOpen={!!deleteChatTargetId} 
        onClose={() => setDeleteChatTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNewChat={handleNewChat}
          chatHistories={chatHistories}
          currentChatId={currentChatId}
          editingChatId={editingChatId}
          editingName={editingName}
          setEditingName={setEditingName}
          onChatClick={handleChatClick}
          onChatRename={handleChatRename}
          onRenameSave={handleRenameSave}
          onChatDelete={handleDeleteClick}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          
          {isWelcomeMode ? (
            <WelcomeScreen
              input={input}
              setInput={setInput}
              onSend={handleSend}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onResultClick={handleResultClick}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 text-sm">AI</div>
                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      <span className="text-xs text-gray-400 ml-1">분석 중...</span>
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
                    placeholder="LAWDING에게 물어보기"
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
