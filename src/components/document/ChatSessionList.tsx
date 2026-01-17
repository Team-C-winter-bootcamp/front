import { ChatSession } from '../../hooks/useChatSessions'
import pencil from '../../assets/pencil.png'
import bin from '../../assets/bin.png'

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
      <div className="text-xs font-bold text-black mb-2 px-1">채팅 목록</div>
      <div className="space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionClick(session.id)}
            className={`group relative p-2.5 rounded-lg cursor-pointer transition-colors text-sm flex items-center ${
              currentSessionId === session.id 
                ?  'text-gray-600 hover:bg-gray-200' 
                : 'text-gray-600 hover:bg-gray-200'
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
                className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none text-xs"
                autoFocus
              />
            ) : (
              <>
                <span className="truncate flex-1">{session.name}</span>
                <div className="hidden group-hover:flex absolute right-2 bg-inherit pl-1">
                  <button onClick={(e) => onSessionRename(session.id, e)} className="hover:text-blue-600 p-1">
                  <div className="inline-block p-1 rounded-full ">
                        <img 
                        src={pencil} 
                        alt="pencil" 
                        className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
                            />
                         </div>
                  </button>
                  <button onClick={(e) => onSessionDeleteClick(session.id, e)} className="hover:text-red-500 p-1">
                  <div className="inline-block p-1 rounded-full ">
                        <img 
                        src={bin} 
                        alt="bin" 
                        className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
                            />
                         </div>
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
