import { ChatSessionList } from './ChatSessionList'
import { FileList } from './FileList'
import { ChatSession, FileItem } from '../../hooks/useChatSessions'
import { useNavigate } from 'react-router-dom'
import { Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface LeftSidebarProps {
  isLeftPanelOpen: boolean
  onTogglePanel: () => void
  sourceWidth: number // 이제 고정 너비를 사용하므로 실제로는 사용되지 않지만 인터페이스 유지를 위해 남김
  sourceResizeRef: React.RefObject<HTMLDivElement>
  onResizeStart: () => void
  fileAreaHeight: number
  fileDividerResizeRef: React.RefObject<HTMLDivElement>
  onFileDividerResizeStart: () => void
  leftSidebarRef: React.RefObject<HTMLDivElement>
  // ChatSessionList props
  sessions: ChatSession[]
  currentSessionId: string
  editingSessionId: string | null
  editingSessionName: string
  setEditingSessionName: (name: string) => void
  onSessionClick: (id: string) => void
  onSessionRename: (id: string, e: React.MouseEvent) => void
  onSessionRenameSave: () => void
  onSessionDeleteClick: (id: string, e: React.MouseEvent) => void
  onSessionTogglePin: (id: string, e: React.MouseEvent) => void
  onNewChat: () => void
  // FileList props
  files: FileItem[]
  editingFileId: string | null
  editingFileName: string
  setEditingFileName: (name: string) => void
  isDragging: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileAdd: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileDeleteClick: (fileId: string) => void
  onFileRenameClick: (fileId: string, currentName: string) => void
  onFileRenameSave: () => void
  onFileToggle: (fileId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export const LeftSidebar = ({
  isLeftPanelOpen,
  onTogglePanel,
  fileAreaHeight,
  fileDividerResizeRef,
  onFileDividerResizeStart,
  leftSidebarRef,
  sessions,
  currentSessionId,
  editingSessionId,
  editingSessionName,
  setEditingSessionName,
  onSessionClick,
  onSessionRename,
  onSessionRenameSave,
  onSessionDeleteClick,
  onSessionTogglePin,
  onNewChat,
  files,
  editingFileId,
  editingFileName,
  setEditingFileName,
  isDragging,
  fileInputRef,
  onFileAdd,
  onFileChange,
  onFileDeleteClick,
  onFileRenameClick,
  onFileRenameSave,
  onFileToggle,
  onDragOver,
  onDragLeave,
  onDrop
}: LeftSidebarProps) => {
  const navigate = useNavigate()
  
  // 닫혔을 때: 얇은 사이드바 + 햄버거 버튼 표시
  if (!isLeftPanelOpen) {
    return (
      <div className="bg-white/80 backdrop-blur-md border-r border-slate-200 flex-shrink-0 flex flex-col h-full transition-all duration-300 w-16 z-20">
        <div className="p-2 flex flex-col items-center gap-4 mt-4">
          <button 
            onClick={onTogglePanel}
            className="text-slate-500 hover:text-indigo-600 transition-colors"
            title="사이드바 열기"
          >
            <PanelLeftOpen size={24} />
          </button>
        </div>
      </div>
    )
  }

  // 열렸을 때: 기존 전체 패널 표시
  return (
    <>
      <div
        ref={leftSidebarRef}
        className="border-r border-slate-200 bg-white flex flex-col flex-shrink-0 z-10 transition-all duration-300 text-slate-700"
        // 너비 조절 기능을 제거했으므로 sourceWidth 대신 고정값 사용 (예: 260px)
        style={{ width: '260px' }}
      >
        {/* 상단: 새 채팅 버튼 (LAWDING 버튼 포함) */}
        <div className="p-4 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="font-black text-lg text-indigo-600 tracking-tight hover:opacity-70 transition-opacity cursor-pointer"
            >
              LAWDING
            </button>
            <button 
              onClick={onTogglePanel}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
              title="패널 접기"
            >
              <PanelLeftClose size={24} />
            </button>
          </div> 

          <button
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 w-full py-3 px-4"
          >
            <Plus size={20} />
            <span className="font-medium text-sm">새 채팅</span>
          </button>
        </div>

        {/* 중단: 채팅 세션 리스트 */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatSessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            editingSessionId={editingSessionId}
            editingSessionName={editingSessionName}
            setEditingSessionName={setEditingSessionName}
            onSessionClick={onSessionClick}
            onSessionRename={onSessionRename}
            onSessionRenameSave={onSessionRenameSave}
            onSessionDeleteClick={onSessionDeleteClick}
            onTogglePin={onSessionTogglePin}
            onNewChat={onNewChat}
            onTogglePanel={onTogglePanel}
            isLeftPanelOpen={isLeftPanelOpen}
          />
        </div>
        
        {/* 드래그 가능한 구분선 (수평 - 유지됨) */}
        <div
          ref={fileDividerResizeRef}
          onMouseDown={(e) => {
            e.preventDefault()
            onFileDividerResizeStart()
          }}
          className="h-6 w-full cursor-ns-resize flex-shrink-0 relative group my-2 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-50"
          title="드래그하여 높이 조절"
        >
          <div className="h-1 w-12 bg-slate-200 rounded-full group-hover:bg-slate-300 transition-colors"></div>
        </div>

        {/* 하단: 소스 (파일 목록) */}
        <div className="flex-shrink-0 overflow-hidden" style={{ height: `${fileAreaHeight}px` }}>
          <FileList
            files={files}
            editingFileId={editingFileId}
            editingFileName={editingFileName}
            setEditingFileName={setEditingFileName}
            isDragging={isDragging}
            fileInputRef={fileInputRef}
            onFileAdd={onFileAdd}
            onFileChange={onFileChange}
            onFileDeleteClick={onFileDeleteClick}
            onFileRenameClick={onFileRenameClick}
            onFileRenameSave={onFileRenameSave}
            onFileToggle={onFileToggle}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        </div>
      </div>


    </>
  )
}