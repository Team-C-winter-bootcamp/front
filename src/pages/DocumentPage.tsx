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
import { LeftSidebar } from '../components/document/LeftSidebar'
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
        
        {/* ================= 왼쪽 패널 영역 ================= */}
        <LeftSidebar
          isLeftPanelOpen={isLeftPanelOpen}
          onTogglePanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          sourceWidth={resize.sourceWidth}
          sourceResizeRef={resize.sourceResizeRef}
          onResizeStart={() => resize.setIsResizingSource(true)}
          fileAreaHeight={resize.fileAreaHeight}
          fileDividerResizeRef={resize.fileDividerResizeRef}
          onFileDividerResizeStart={() => resize.setIsResizingFileDivider(true)}
          leftSidebarRef={resize.leftSidebarRef}
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

        {/* ================= 중앙 채팅 영역 ================= */}
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
          onLeftPanelToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          onRightPanelToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
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

        {/* ================= 오른쪽 메모 패널 영역 ================= */}
        {/* 중요: 여기서 {isRightPanelOpen && ...} 조건문을 꼭 제거해야 합니다! */}
        {/* MemoPanel 내부에서 닫힘 상태를 처리하므로 항상 렌더링해야 합니다. */}
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
          onOpenPanel={() => setIsRightPanelOpen(true)}
          isRightPanelOpen={isRightPanelOpen}
          memoWidth={resize.memoWidth}
        />
      </div>
    </div>
  )
}

export default DocumentPage