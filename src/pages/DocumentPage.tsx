import { useState } from 'react'
import Header from '../components/Header'
import DeleteAlertModal from '../components/AlertModal/DeleteAlertModal'
import MomoAlertModal from '../components/AlertModal/MomoAlertModal'
import FileAlertModal from '../components/AlertModal/FileAlertModal'
import { useChatSessions } from '../hooks/useChatSessions'
import { useFileManagement } from '../hooks/useFileManagement'
import { useMemoManagement } from '../hooks/useMemoManagement'
import { useResize } from '../hooks/useResize'
import { useChat } from '../hooks/useChat'
import { ChatSessionList } from '../components/document/ChatSessionList'
import { FileList } from '../components/document/FileList'
import { ChatArea } from '../components/document/ChatArea'
import { MemoPanel } from '../components/document/MemoPanel'

const DocumentPage = () => {
  // 패널 접기/펼치기 State
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  
  // 세션 삭제 모달 State
  const [deleteSessionTargetId, setDeleteSessionTargetId] = useState<string | null>(null)
  const [, setIsProcessing] = useState(false)
  
  // 커스텀 훅 사용
  const chatSessions = useChatSessions()
  const resize = useResize()
  
  const fileManagement = useFileManagement({
    updateCurrentSessionFiles: chatSessions.updateCurrentSessionFiles,
    updateCurrentSessionMessages: chatSessions.updateCurrentSessionMessages,
    setIsProcessing
  })

  const memoManagement = useMemoManagement()

  const chat = useChat({
    currentSessionFiles: chatSessions.currentSession.files,
    updateCurrentSessionMessages: chatSessions.updateCurrentSessionMessages,
    setIsProcessing
  })

  // 세션 삭제 핸들러
  const handleSessionDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteSessionTargetId(id)
  }

  const confirmSessionDelete = () => {
    if (!deleteSessionTargetId) return
    chatSessions.confirmSessionDelete(deleteSessionTargetId)
    setDeleteSessionTargetId(null)
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden text-gray-900">
      <Header />
      
      {/* 모달 렌더링 */}
      <DeleteAlertModal 
        isOpen={!!deleteSessionTargetId} 
        onClose={() => setDeleteSessionTargetId(null)}
        onConfirm={confirmSessionDelete}
      />
      
      <MomoAlertModal 
        isOpen={!!memoManagement.deleteMemoTargetId} 
        onClose={() => memoManagement.setDeleteMemoTargetId(null)}
        onConfirm={memoManagement.confirmMemoDelete}
      />

      <FileAlertModal 
        isOpen={!!fileManagement.deleteFileTargetId} 
        onClose={() => fileManagement.setDeleteFileTargetId(null)}
        onConfirm={fileManagement.confirmFileDelete}
      />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel - Chat List & Source (Collapsible) */}
        {isLeftPanelOpen && (
            <div
            className="border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 z-10"
            style={{ width: `${resize.sourceWidth}px` }}
            >
            {/* 상단: 새 채팅 버튼 (햄버거 메뉴 포함) */}
            <div className="p-4 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                  onClick={chatSessions.handleNewChat}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
                    >
                        <span>+</span>
                        <span>새 채팅</span>
                    </button>
                    {/* 패널 접기 버튼 (햄버거) */}
                    <button 
                        onClick={() => setIsLeftPanelOpen(false)}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="패널 접기"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* 중단: 채팅 세션 리스트 */}
            <ChatSessionList
              sessions={chatSessions.sessions}
              currentSessionId={chatSessions.currentSessionId}
              editingSessionId={chatSessions.editingSessionId}
              editingSessionName={chatSessions.editingSessionName}
              setEditingSessionName={chatSessions.setEditingSessionName}
              onSessionClick={chatSessions.handleSessionClick}
              onSessionRename={chatSessions.handleSessionRename}
              onSessionRenameSave={chatSessions.handleSessionRenameSave}
              onSessionDeleteClick={handleSessionDeleteClick}
              onNewChat={chatSessions.handleNewChat}
              onTogglePanel={() => setIsLeftPanelOpen(false)}
              isLeftPanelOpen={isLeftPanelOpen}
            />
            
            <div className="h-px bg-gray-200 mx-4 my-2"></div>

            {/* 하단: 소스 (파일 목록) */}
            <FileList
              files={chatSessions.currentSession?.files || []}
              editingFileId={fileManagement.editingFileId}
              editingFileName={fileManagement.editingFileName}
              setEditingFileName={fileManagement.setEditingFileName}
              isDragging={fileManagement.isDragging}
              fileInputRef={fileManagement.fileInputRef}
              onFileAdd={fileManagement.handleFileAdd}
              onFileChange={fileManagement.handleFileChange}
              onFileDeleteClick={fileManagement.handleFileDeleteClick}
              onFileRenameClick={fileManagement.handleFileRenameClick}
              onFileRenameSave={fileManagement.handleFileRenameSave}
              onFileToggle={fileManagement.handleFileToggle}
              onDragOver={fileManagement.handleDragOver}
              onDragLeave={fileManagement.handleDragLeave}
              onDrop={fileManagement.handleDrop}
            />
            </div>
        )}

        {isLeftPanelOpen && (
            <div
            ref={resize.sourceResizeRef}
            onMouseDown={(e) => {
                e.preventDefault()
              resize.setIsResizingSource(true)
            }}
            className="w-1 bg-gray-200 cursor-ew-resize hover:bg-blue-400 transition-colors flex-shrink-0"
            />
        )}

        {/* Center Panel - Chat */}
        <ChatArea
          messages={chatSessions.currentSession.messages}
          isProcessing={chat.isProcessing}
          chatInput={chat.chatInput}
          setChatInput={chat.setChatInput}
          onChatSend={chat.handleChatSend}
          onAddToMemo={memoManagement.handleAddToMemo}
          chatEndRef={chat.chatEndRef}
          sessionName={chatSessions.currentSession.name}
          isLeftPanelOpen={isLeftPanelOpen}
          isRightPanelOpen={isRightPanelOpen}
          onLeftPanelToggle={() => setIsLeftPanelOpen(true)}
          onRightPanelToggle={() => setIsRightPanelOpen(true)}
        />

        {/* 채팅-메모 사이 드래그 핸들 (Right Resize Handle) */}
        {isRightPanelOpen && (
            <div
            ref={resize.memoResizeRef}
            onMouseDown={(e) => {
                e.preventDefault()
              resize.setIsResizingMemo(true)
            }}
            className="w-1 bg-gray-200 cursor-ew-resize hover:bg-blue-400 transition-colors flex-shrink-0"
            />
        )}

        {/* Right Panel - Memo (Collapsible) */}
        <MemoPanel
          selectedMemoId={memoManagement.selectedMemoId}
          editingMemoName={memoManagement.editingMemoName}
          editingMemoNameValue={memoManagement.editingMemoNameValue}
          setEditingMemoNameValue={memoManagement.setEditingMemoNameValue}
          textareaRef={memoManagement.textareaRef}
          onMemoClick={memoManagement.handleMemoClick}
          onMemoDeleteClick={memoManagement.handleMemoDeleteClick}
          onMemoNameEdit={memoManagement.handleMemoNameEdit}
          onMemoNameSave={memoManagement.handleMemoNameSave}
          onMemoContentChange={memoManagement.handleMemoContentChange}
          onAddNewMemo={memoManagement.handleAddNewMemo}
          onUndo={memoManagement.handleUndo}
          onRedo={memoManagement.handleRedo}
          onPaste={memoManagement.handlePaste}
          onWrapText={memoManagement.wrapText}
          onConvertToHWP={memoManagement.handleConvertToHWP}
          onConvertToWord={memoManagement.handleConvertToWord}
          onTogglePanel={() => setIsRightPanelOpen(false)}
          isRightPanelOpen={isRightPanelOpen}
          memoWidth={resize.memoWidth}
        />
      </div>
    </div>
  )
}

export default DocumentPage
