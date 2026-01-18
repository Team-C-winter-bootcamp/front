import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatHistory } from '../../store/useStore'
// 사용하지 않는 아이콘(Settings, Wrench, LogOut, Menu) import 제거
import { 
  Plus, 
  History, 
  MessageSquare, 
  Edit2, 
  Trash2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

interface ChatSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNewChat: () => void
  chatHistories: ChatHistory[]
  currentChatId: string | null
  editingChatId: string | null
  editingName: string
  setEditingName: (name: string) => void
  onChatClick: (chatId: string) => void
  onChatRename: (chatId: string, e: React.MouseEvent) => void
  onRenameSave: () => void
  onChatDelete: (chatId: string, e: React.MouseEvent) => void
}

export const ChatSidebar = ({
  isCollapsed,
  onToggleCollapse,
  onNewChat,
  chatHistories,
  currentChatId,
  editingChatId,
  editingName,
  setEditingName,
  onChatClick,
  onChatRename,
  onRenameSave,
  onChatDelete
}: ChatSidebarProps) => {
  // --- 리사이징 관련 로직 (유지) ---
  const [sidebarWidth, setSidebarWidth] = useState(260); 
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    resizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (resizingRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= 160 && newWidth <= 480) {
        setSidebarWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  // -----------------------------

  return (
    <aside
      className="bg-[#111e31] border-r border-[#1E293B] flex-shrink-0 flex flex-col h-full relative font-sans text-slate-300 transition-all duration-300"
      style={{ width: isCollapsed ? '70px' : `${sidebarWidth}px` }}
    >
      {/* 상단 영역: 로고/토글 및 새 채팅 버튼 */}
      <div className="p-4 flex flex-col gap-4 flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           {/* 로고 영역 */}
           {!isCollapsed && (
             <span className="font-bold text-lg text-white tracking-wider">LAWDING</span>
           )}
           {/* 토글 버튼 */}
           <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
          </button>
        </div>

        {/* 새 채팅 버튼 */}
        <button
          onClick={onNewChat}
          className={`flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition-all shadow-md ${
            isCollapsed ? 'w-10 h-10 p-0 mx-auto' : 'w-full py-3 px-4'
          }`}
        >
          <Plus size={20} />
          {!isCollapsed && <span className="font-medium text-sm">새 채팅</span>}
        </button>
      </div>

      {/* 중단 영역: 채팅 히스토리 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {!isCollapsed ? (
          <>
            {/* 메뉴 헤더 */}
            <div className="flex items-center gap-3 px-3 py-2 text-slate-400 mb-2">
              <History size={18} />
              <span className="text-sm font-semibold">히스토리</span>
            </div>

            {/* 채팅 목록 */}
            <div className="space-y-1 mb-6">
              {chatHistories?.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatClick(chat.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all text-sm flex items-center gap-3 ${
                    currentChatId === chat.id 
                      ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-[#334155]' 
                      : 'text-slate-400 hover:bg-[#1E293B]/50 hover:text-slate-200'
                  }`} 
                >
                  <MessageSquare size={16} className={currentChatId === chat.id ? 'text-blue-400' : 'opacity-70'} />
                  
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={onRenameSave}
                      onKeyDown={(e) => e.key === 'Enter' && onRenameSave()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-[#0F172A] border border-blue-500 rounded px-2 py-1 text-white text-sm outline-none"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="truncate flex-1">{chat.name}</span>
                      <div className="hidden group-hover:flex gap-2 absolute right-2 bg-[#1E293B] pl-2 rounded shadow-sm">
                        <button onClick={(e) => onChatRename(chat.id, e)} className="text-slate-400 hover:text-white">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => onChatDelete(chat.id, e)} className="text-slate-400 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* 설정, 법률 도구 메뉴 섹션 삭제됨 */}
          </>
        ) : (
          /* 접혔을 때 히스토리 아이콘만 표시 */
          <div className="flex flex-col items-center gap-4 mt-2">
             <button className="p-2 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg" title="히스토리">
               <History size={20} />
             </button>
             {/* 설정 아이콘 삭제됨 */}
          </div>
        )}
      </div>

      {/* 하단 로그아웃 영역 삭제됨 */}

      {/* 리사이즈 드래그 핸들 */}
      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize group flex items-center justify-center z-30 hover:bg-blue-500/50 transition-colors"
        >
        </div>
      )}
    </aside>
  )
}