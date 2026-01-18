import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatHistory } from '../../store/useStore'
import { 
  Plus, 
  History, 
  MessageSquare, 
  Edit2, 
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  Pin,
  PinOff
} from 'lucide-react'

// ExtendedChatHistory 정의
interface ExtendedChatHistory extends ChatHistory {
  isPinned?: boolean;
}

interface ChatSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNewChat: () => void
  chatHistories: ExtendedChatHistory[]
  currentChatId: string | null
  editingChatId: string | null
  editingName: string
  setEditingName: (name: string) => void
  onChatClick: (chatId: string) => void
  onChatRename: (chatId: string, e: React.MouseEvent) => void
  onRenameSave: () => void
  onChatDelete: (chatId: string, e: React.MouseEvent) => void
  onTogglePin: (chatId: string, e: React.MouseEvent) => void
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
  onChatDelete,
  onTogglePin
}: ChatSidebarProps) => {
  const navigate = useNavigate()
  
  // --- 리사이징 관련 로직 ---
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

  // --- 미트볼 메뉴 로직 ---
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === chatId ? null : chatId);
  };

  // --- 정렬 로직 ---
  // 고정된 채팅(Pinned)을 상단으로, 나머지는 기존 순서 유지
  const sortedHistories = (() => {
    if (!chatHistories) return [];
    
    const pinnedChats = chatHistories.filter(chat => chat.isPinned);
    const unpinnedChats = chatHistories.filter(chat => !chat.isPinned);
    
    return [...pinnedChats, ...unpinnedChats];
  })();

  return (
    <aside
      className="bg-[#111e31] border-r border-[#1E293B] flex-shrink-0 flex flex-col h-full relative font-sans text-slate-300 transition-all duration-300"
      style={{ width: isCollapsed ? '70px' : `${sidebarWidth}px` }}
    >
      {/* 상단 영역 */}
      <div className="p-4 flex flex-col gap-4 flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           {!isCollapsed && (
             <button 
               onClick={() => navigate('/')}
               className="font-bold text-lg text-white tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
             >
               LAWDING
             </button>
           )}
           <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
          </button>
        </div>

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
            <div className="flex items-center gap-3 px-3 py-2 text-slate-400 mb-2">
              <History size={18} />
              <span className="text-sm font-semibold">히스토리</span>
            </div>

            <div className="space-y-1 mb-6 pb-20">
              {sortedHistories.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatClick(chat.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all text-sm flex items-center gap-3 ${
                    currentChatId === chat.id 
                      ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-[#334155]' 
                      : 'text-slate-400 hover:bg-[#1E293B]/50 hover:text-slate-200'
                  }`} 
                >
                  {/* 왼쪽 말풍선 아이콘 */}
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
                      {/* 채팅방 이름 (남은 공간 차지하여 오른쪽 요소 밀어냄) */}
                      <span className="truncate flex-1">{chat.name}</span>
                      
                      {/* 고정 핀 아이콘 (이름 오른쪽, 메뉴 왼쪽) */}
                      {chat.isPinned && (
                        // Lucide 아이콘 사용 시
                        <Pin size={14} className="text-blue-400 fill-blue-400/20 rotate-45 flex-shrink-0" />
                        
                        /* 이미지(fin.png) 사용 시 위 Pin 컴포넌트를 지우고 아래 주석 해제
                        <img 
                            src="assets/fin.png" 
                            alt="pinned" 
                            className="w-3.5 h-3.5 opacity-80 flex-shrink-0"
                        />
                        */
                      )}

                      {/* 미트볼 메뉴 버튼 */}
                      <div className="relative">
                        <button 
                          onClick={(e) => handleMenuToggle(chat.id, e)} 
                          className={`p-1 rounded hover:bg-slate-700 transition-colors ${openMenuId === chat.id ? 'opacity-100 bg-slate-700' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          {/* Lucide 아이콘 사용 시 */}
                          <MoreVertical size={16} className="text-slate-400" />

                          {/* 이미지(vertical_dot.png) 사용 시 위 MoreVertical 컴포넌트를 지우고 아래 주석 해제
                          <img 
                            src="assets/vertical_dot.png" 
                            alt="menu" 
                            className="w-4 h-4 object-contain filter invert opacity-70"
                            style={{ filter: 'brightness(0) invert(0.8)' }} 
                          />
                          */ }
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {openMenuId === chat.id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-0 top-8 z-50 w-32 bg-[#2D3748] border border-slate-600 rounded-md shadow-xl overflow-hidden py-1 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. 고정 하기/해제 */}
                            <button
                              onClick={(e) => {
                                onTogglePin(chat.id, e);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600 w-full text-left transition-colors"
                            >
                              {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                              <span>{chat.isPinned ? '고정 해제' : '고정'}</span>
                            </button>

                            {/* 2. 이름 변경 */}
                            <button
                              onClick={(e) => {
                                onChatRename(chat.id, e);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-slate-600 w-full text-left transition-colors"
                            >
                              <Edit2 size={14} />
                              <span>이름 변경</span>
                            </button>

                            {/* 3. 삭제 */}
                            <button
                              onClick={(e) => {
                                onChatDelete(chat.id, e);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-600 w-full text-left transition-colors"
                            >
                              <Trash2 size={14} />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 접혔을 때 */
          <div className="flex flex-col items-center gap-4 mt-2">
             <button className="p-2 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-lg" title="히스토리">
               <History size={20} />
             </button>
          </div>
        )}
      </div>

      {/* 리사이즈 핸들 */}
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