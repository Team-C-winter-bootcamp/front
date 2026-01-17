import { ChatSession } from '../../hooks/useChatSessions'
import { MessageSquare, Edit2, Trash2 } from 'lucide-react'

interface ChatSessionListProps {
  sessions: ChatSession[]
  currentSessionId: string
  editingSessionId: string | null
  editingSessionName: string
  setEditingSessionName: (name: string) => void
  onSessionClick: (id: string) => void
  onSessionRename: (id: string, e: React.MouseEvent) => void
  onSessionRenameSave: () => void
  onSessionDeleteClick: (id: string, e: React.MouseEvent) => void
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
  onNewChat: _onNewChat,
  onTogglePanel: _onTogglePanel,
  isLeftPanelOpen
}: ChatSessionListProps) => {
  if (!isLeftPanelOpen) return null

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
      <div className="flex items-center gap-3 px-3 py-2 text-slate-400 mb-2">
        <span className="text-sm font-semibold">히스토리</span>
      </div>
      <div className="space-y-1 mb-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionClick(session.id)}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all text-sm flex items-center gap-3 ${
              currentSessionId === session.id 
                ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-[#334155]' 
                : 'text-slate-400 hover:bg-[#1E293B]/50 hover:text-slate-200'
            }`}
          >
            {editingSessionId === session.id ? (
              <input
                type="text"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onBlur={onSessionRenameSave}
                onKeyDown={(e) => e.key === 'Enter' && onSessionRenameSave()}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-[#0F172A] border border-blue-500 rounded px-2 py-1 text-white text-sm outline-none"
                autoFocus
              />
            ) : (
              <>
                <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-400' : 'opacity-70'} />
                <span className="truncate flex-1">{session.name}</span>
                <div className="hidden group-hover:flex gap-2 absolute right-2 bg-[#1E293B] pl-2 rounded shadow-sm">
                  <button onClick={(e) => onSessionRename(session.id, e)} className="text-slate-400 hover:text-white">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => onSessionDeleteClick(session.id, e)} className="text-slate-400 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}