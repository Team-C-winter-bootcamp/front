import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatHistory } from '../../store/useStore'
import pencil from '../../assets/pencil.png'
import bin from '../../assets/bin.png'
import plus from '../../assets/plus.png'
import burger from '../../assets/burger.png'

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
  // --- [추가] 리사이징 관련 로직 ---
  const [sidebarWidth, setSidebarWidth] = useState(256); // 기본 w-64 = 256px
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
      // 최소 160px, 최대 480px 제한
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
      className="bg-gray-50 border-r border-gray-200 transition-all duration-300 flex-shrink-0 flex flex-col h-full relative"
      style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px` }} // 동적 너비 적용
    >
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm text-sm font-bold"
          >
            <span>+</span>
            <span>새 채팅</span>
          </button>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors ${isCollapsed ? 'mx-auto' : 'ml-2'}`}
        >
          {isCollapsed ? '➜' : (
            <div className="inline-block p-1 rounded-full">
              <img src={burger} alt="burger" className="w-5 h-5 object-contain opacity-60 pt-1" />
            </div>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
          <div className="text-xs font-bold text-black mb-3 px-2">최근 기록</div>
          <div className="space-y-1">
            {chatHistories?.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatClick(chat.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors text-sm flex items-center ${
                  currentChatId === chat.id ? 'bg-gray-200 text-black font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={onRenameSave}
                    onKeyDown={(e) => e.key === 'Enter' && onRenameSave()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="truncate flex-1">{chat.name}</span>
                    <div className="hidden group-hover:flex gap-1 absolute right-2 bg-inherit pl-2">
                      <button onClick={(e) => onChatRename(chat.id, e)} className="hover:text-blue-600">
                        <div className="inline-block p-1 rounded-full">
                          <img src={pencil} alt="pencil" className="w-5 h-5 object-contain opacity-60 pt-1" />
                        </div>
                      </button>
                      <button onClick={(e) => onChatDelete(chat.id, e)} className="hover:text-red-500">
                        <div className="inline-block p-1 rounded-full">
                          <img src={bin} alt="bin" className="w-5 h-5 object-contain opacity-60 pt-1" />
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 flex flex-col items-center gap-4">
          <button onClick={onNewChat} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm">
            <div className="inline-block p-1 rounded-full">
              <img src={plus} alt="plus" className="w-5 h-5 object-contain opacity-60 pt-1" />
            </div>
          </button>
        </div>
      )}

      {/* --- [추가] 리사이즈 드래그 핸들 --- */}
      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize group flex items-center justify-center z-30"
        >
          {/* 평소에는 투명하다가 hover 시 파란색으로 변하는 바 */}
          <div className="w-[5px] h-full bg-transparent group-hover:bg-gray-400 transition-colors"></div>
        </div>
      )}
    </aside>
  )
}