import { useState, useEffect } from 'react'
import { sessionService } from '../api'

export interface ChatMessage {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
  isSummary?: boolean 
  fileName?: string   
}

export interface ChatSession {
  id: string
  name: string
  messages: ChatMessage[]
  files: FileItem[]
  createdAt: Date
}

export interface FileItem {
  id: string
  name: string
  file: File
  isSelected: boolean
}

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  // API에서 세션 목록 로드
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoadingSessions(true)
        const sessionList = await sessionService.getList()
        const loadedSessions: ChatSession[] = sessionList.map(s => ({
          id: s.id.toString(),
          name: s.title,
          messages: [],
          files: [],
          createdAt: new Date()
        }))
        setSessions(loadedSessions)
        
        // 로컬 스토리지의 파일 정보는 유지 (API에 파일 정보가 없는 경우)
        const savedSessions = localStorage.getItem('doc_sessions')
        if (savedSessions) {
          try {
            const parsed = JSON.parse(savedSessions)
            if (Array.isArray(parsed)) {
              loadedSessions.forEach(loaded => {
                const saved = parsed.find((p: any) => p.id === loaded.id)
                if (saved && saved.files) {
                  loaded.files = saved.files.map((f: any) => ({
                    ...f,
                    file: new File([""], f.name || "unknown")
                  }))
                }
              })
            }
          } catch (e) {
            console.error("Failed to parse saved sessions", e)
          }
        }
      } catch (error) {
        console.error('세션 목록 로드 실패:', error)
        // 에러 시 기본 세션 생성
        setSessions([{ 
          id: '1', 
          name: '새로운 채팅', 
          messages: [], 
          files: [], 
          createdAt: new Date() 
        }])
      } finally {
        setIsLoadingSessions(false)
      }
    }
    loadSessions()
  }, [])

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem('doc_currentSessionId') || '1'
  })

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingSessionName, setEditingSessionName] = useState('')

  useEffect(() => {
    // File 객체와 Date 객체는 JSON.stringify가 안되므로 제외하고 저장
    // 파일 정보만 로컬 스토리지에 저장 (API에는 파일 정보가 없으므로)
    if (!isLoadingSessions) {
      const sessionsToSave = sessions.map(s => ({
        id: s.id,
        name: s.name,
        createdAt: s.createdAt.toISOString(),
        messages: s.messages.map(m => ({
          id: m.id,
          text: m.text,
          isUser: m.isUser,
          timestamp: m.timestamp.toISOString(),
          isSummary: m.isSummary,
          fileName: m.fileName
        })),
        files: s.files.map(f => ({
          id: f.id,
          name: f.name,
          isSelected: f.isSelected
          // file 객체는 제외
        }))
      }))
      localStorage.setItem('doc_sessions', JSON.stringify(sessionsToSave))
    }
  }, [sessions, isLoadingSessions])

  useEffect(() => {
    localStorage.setItem('doc_currentSessionId', currentSessionId)
  }, [currentSessionId])

  // currentSession이 항상 유효한 값을 가지도록 보장
  const currentSession: ChatSession = (() => {
    if (sessions.length === 0) {
      return {
        id: '1',
        name: '새로운 채팅',
        messages: [],
        files: [],
        createdAt: new Date()
      }
    }
    const found = sessions.find(s => s.id === currentSessionId)
    return found || sessions[0]
  })()

  const handleNewChat = async () => {
    try {
      // API를 통해 새 채팅 생성
      const newChatData = await sessionService.newChat({ message: '' })
      const newSession: ChatSession = {
        id: newChatData.session_id.toString(),
        name: newChatData.title,
        messages: [],
        files: [],
        createdAt: new Date()
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    } catch (error) {
      console.error('새 채팅 생성 실패:', error)
      // 에러 시 로컬 세션 생성
      const newSession: ChatSession = {
        id: Date.now().toString(),
        name: '새로운 채팅',
        messages: [],
        files: [],
        createdAt: new Date()
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    }
  }

  const handleSessionClick = async (id: string) => {
    setCurrentSessionId(id)
    // 세션 클릭 시 메시지 로드
    try {
      const sessionId = parseInt(id)
      if (!isNaN(sessionId)) {
        const messageData = await sessionService.getMessage(sessionId)
        const loadedMessages: ChatMessage[] = messageData.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date()
        }))
        updateCurrentSessionMessages(() => loadedMessages)
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error)
    }
  }

  const handleSessionRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const session = sessions.find(s => s.id === id)
    if (session) {
      setEditingSessionId(id)
      setEditingSessionName(session.name)
    }
  }

  const handleSessionRenameSave = async () => {
    if (editingSessionId && editingSessionName.trim()) {
      try {
        const sessionId = parseInt(editingSessionId)
        if (!isNaN(sessionId)) {
          await sessionService.modify(sessionId, {
            title: editingSessionName.trim(),
            bookmark: false // 기존 북마크 상태 유지 (필요시 저장된 값 사용)
          })
        }
        setSessions(prev => prev.map(s => 
          s.id === editingSessionId ? { ...s, name: editingSessionName.trim() } : s
        ))
        setEditingSessionId(null)
      } catch (error) {
        console.error('세션 이름 변경 실패:', error)
        // 에러 시에도 UI는 업데이트
        setSessions(prev => prev.map(s => 
          s.id === editingSessionId ? { ...s, name: editingSessionName.trim() } : s
        ))
        setEditingSessionId(null)
      }
    }
  }

  const handleSessionDeleteClick = (_id: string, e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const confirmSessionDelete = async (deleteSessionTargetId: string) => {
    try {
      const sessionId = parseInt(deleteSessionTargetId)
      if (!isNaN(sessionId)) {
        await sessionService.delete(sessionId)
      }
      const remaining = sessions.filter(s => s.id !== deleteSessionTargetId)
      setSessions(remaining)
      
      if (currentSessionId === deleteSessionTargetId && remaining.length > 0) {
        setCurrentSessionId(remaining[0].id)
      } else if (remaining.length === 0) {
        handleNewChat()
      }
    } catch (error) {
      console.error('세션 삭제 실패:', error)
      // 에러 시에도 UI는 업데이트
      const remaining = sessions.filter(s => s.id !== deleteSessionTargetId)
      setSessions(remaining)
      
      if (currentSessionId === deleteSessionTargetId && remaining.length > 0) {
        setCurrentSessionId(remaining[0].id)
      } else if (remaining.length === 0) {
        handleNewChat()
      }
    }
  }

  const updateCurrentSessionFiles = (updater: (files: FileItem[]) => FileItem[]) => {
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, files: updater(s.files) } : s
    ))
  }

  const updateCurrentSessionMessages = (updater: (msgs: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, messages: updater(s.messages) } : s
    ))
  }

  return {
    sessions,
    currentSession,
    currentSessionId,
    editingSessionId,
    editingSessionName,
    setEditingSessionName,
    handleNewChat,
    handleSessionClick,
    handleSessionRename,
    handleSessionRenameSave,
    handleSessionDeleteClick,
    confirmSessionDelete,
    updateCurrentSessionFiles,
    updateCurrentSessionMessages
  }
}
