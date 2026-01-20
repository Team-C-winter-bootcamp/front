import { useState, useEffect, useRef } from 'react'
import { ChatSession } from '../../hooks/useChatSessions'
import { MessageSquare, Edit2, Trash2, MoreVertical, Pin, PinOff } from 'lucide-react'

// ExtendedChatSession 정의 (isPinned 필드 추가)
interface ExtendedChatSession extends ChatSession {
  isPinned?: boolean;
}

interface ChatSessionListProps {
  sessions: ExtendedChatSession[]
  currentSessionId: string
  editingSessionId: string | null
  editingSessionName: string
  setEditingSessionName: (name: string) => void
  onSessionClick: (id: string) => void
  onSessionRename: (id: string, e: React.MouseEvent) => void
  onSessionRenameSave: () => void
  onSessionDeleteClick: (id: string, e: React.MouseEvent) => void
  onTogglePin: (sessionId: string, e: React.MouseEvent) => void
  onNewChat: () => void
  onTogglePanel: () => void
  isLeftPanelOpen: boolean
}

export const ChatSessionList = ({
  sessions,
  currentSessionId,
  editingSessionId,
  editingSessionName,
  setEditingSessionName,
  onSessionClick,
  onSessionRename,
  onSessionRenameSave,
  onSessionDeleteClick,
  onTogglePin,
  onNewChat: _onNewChat,
  onTogglePanel: _onTogglePanel,
  isLeftPanelOpen
}: ChatSessionListProps) => {
  if (!isLeftPanelOpen) return null

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

  const handleMenuToggle = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === sessionId ? null : sessionId);
  };

  // --- 정렬 로직 ---
  // 고정된 세션(Pinned)을 상단으로, 나머지는 기존 순서 유지
  const sortedSessions = (() => {
    if (!sessions) return [];
    
    const pinnedSessions = sessions.filter(session => session.isPinned);
    const unpinnedSessions = sessions.filter(session => !session.isPinned);
    
    return [...pinnedSessions, ...unpinnedSessions];
  })();

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar bg-white">
      <div className="flex items-center gap-3 px-3 py-2 text-slate-500 mb-2">
        <span className="text-sm font-semibold text-slate-700">히스토리</span>
      </div>
      <div className="space-y-1 mb-6 pb-20">
        {sortedSessions.map((session) => (
          <div
            key={session.id} 
            onClick={() => onSessionClick(session.id)}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all text-sm flex items-center gap-3 ${
              currentSessionId === session.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            {/* 왼쪽 말풍선 아이콘 */}
            <MessageSquare size={16} className={currentSessionId === session.id ? 'text-indigo-600' : 'opacity-70'} />
            
            {editingSessionId === session.id ? (
              <input
                type="text"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onBlur={onSessionRenameSave}
                onKeyDown={(e) => e.key === 'Enter' && onSessionRenameSave()}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                autoFocus
              />
            ) : (
              <>
                {/* 채팅방 이름 (남은 공간 차지하여 오른쪽 요소 밀어냄) */}
                <span className="truncate flex-1">{session.name}</span>
                
                {/* 고정 핀 아이콘 (이름 오른쪽, 메뉴 왼쪽) */}
                {session.isPinned && (
                  <Pin size={14} className="text-indigo-600 fill-indigo-200 rotate-45 flex-shrink-0" />
                )}

                {/* 미트볼 메뉴 버튼 */}
                <div className="relative">
                  <button 
                    onClick={(e) => handleMenuToggle(session.id, e)} 
                    className={`p-1 rounded hover:bg-slate-100 transition-colors ${openMenuId === session.id ? 'opacity-100 bg-slate-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <MoreVertical size={16} className="text-slate-500" />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {openMenuId === session.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 top-8 z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 1. 고정 하기/해제 */}
                      <button
                        onClick={(e) => {
                          onTogglePin(session.id, e);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                      >
                        {session.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        <span>{session.isPinned ? '고정 해제' : '고정'}</span>
                      </button>

                      {/* 2. 이름 변경 */}
                      <button
                        onClick={(e) => {
                          onSessionRename(session.id, e);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                      >
                        <Edit2 size={14} />
                        <span>이름 변경</span>
                      </button>

                      {/* 3. 삭제 */}
                      <button
                        onClick={(e) => {
                          onSessionDeleteClick(session.id, e);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
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
    </div>
  )
}