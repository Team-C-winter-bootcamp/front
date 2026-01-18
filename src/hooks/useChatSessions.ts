import { useState, useEffect } from 'react'

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
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const savedSessions = localStorage.getItem('doc_sessions')
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            messages: (s.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })),
            files: (s.files || []).map((f: any) => ({
              ...f,
              file: new File([""], f.name || "unknown") 
            }))
          }))
        }
      } catch (e) {
        console.error("Failed to parse sessions", e)
      }
    }
    return [{ 
      id: '1', 
      name: '새로운 채팅', 
      messages: [], 
      files: [], 
      createdAt: new Date() 
    }]
  })

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem('doc_currentSessionId') || '1'
  })

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingSessionName, setEditingSessionName] = useState('')

  useEffect(() => {
    // File 객체와 Date 객체는 JSON.stringify가 안되므로 제외하고 저장
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
  }, [sessions])

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

  const handleNewChat = () => {
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

  const handleSessionClick = (id: string) => {
    setCurrentSessionId(id)
  }

  const handleSessionRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const session = sessions.find(s => s.id === id)
    if (session) {
      setEditingSessionId(id)
      setEditingSessionName(session.name)
    }
  }

  const handleSessionRenameSave = () => {
    if (editingSessionId && editingSessionName.trim()) {
      setSessions(prev => prev.map(s => 
        s.id === editingSessionId ? { ...s, name: editingSessionName.trim() } : s
      ))
      setEditingSessionId(null)
    }
  }

  const handleSessionDeleteClick = (_id: string, e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const confirmSessionDelete = (deleteSessionTargetId: string) => {
    const remaining = sessions.filter(s => s.id !== deleteSessionTargetId)
    setSessions(remaining)
    
    if (currentSessionId === deleteSessionTargetId && remaining.length > 0) {
      setCurrentSessionId(remaining[0].id)
    } else if (remaining.length === 0) {
      handleNewChat()
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
