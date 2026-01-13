import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Header from '../components/Header'

// --- 모달 컴포넌트 정의 (요청하신 코드) ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// 1. 채팅방 삭제 알림 모달
const DeleteAlertModal = ({ isOpen, onClose, onConfirm }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-80 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b text-center">
          <h2 className="text-lg font-bold text-black">알림</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-800 font-medium whitespace-pre-line">
            이 채팅방을 삭제하시겠습니까?
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-blue-200 hover:bg-blue-300 text-black font-bold transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

// 2. 메모 삭제 알림 모달
const MomoAlertModal = ({ isOpen, onClose, onConfirm }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-80 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b text-center">
          <h2 className="text-lg font-bold text-black">알림</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-800 font-medium whitespace-pre-line">
            이 메모를 삭제하시겠습니까?
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-blue-200 hover:bg-blue-300 text-black font-bold transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

// --- 타입 정의 ---
interface FileItem {
  id: string
  name: string
  file: File
  isSelected: boolean
}

interface ChatMessage {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
  isSummary?: boolean 
  fileName?: string   
}

interface ChatSession {
    id: string;
    name: string;
    messages: ChatMessage[];
    files: FileItem[];
    createdAt: Date;
}

const DocumentPage = () => {
  const { isAuthenticated, memos, setMemos, updateMemo, addMemo, deleteMemo } = useStore()
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceResizeRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // --- 세션(채팅방) 관리 State ---
  const [sessions, setSessions] = useState<ChatSession[]>([
    { 
        id: '1', 
        name: '새로운 채팅', 
        messages: [], 
        files: [], 
        createdAt: new Date() 
    }
  ])
  const [currentSessionId, setCurrentSessionId] = useState<string>('1')

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  // 세션 이름 수정 관련 State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionName, setEditingSessionName] = useState('');

  // ✅ [추가] 삭제 모달 State
  const [deleteSessionTargetId, setDeleteSessionTargetId] = useState<string | null>(null); // 채팅방 삭제 대상
  const [deleteMemoTargetId, setDeleteMemoTargetId] = useState<string | null>(null);       // 메모 삭제 대상

  // UI State
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Memo UI State
  const [editingMemoName, setEditingMemoName] = useState(false)
  const [editingMemoNameValue, setEditingMemoNameValue] = useState('')

  // Resize State
  const [sourceWidth, setSourceWidth] = useState(280)
  const [isResizingSource, setIsResizingSource] = useState(false)

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false)

  // History State
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // --- Effects ---

  useEffect(() => {
    if (memos.length === 0) {
      setMemos([{ id: '1', title: '새 메모', content: '' }])
      setSelectedMemoId('1')
    }
  }, [memos.length, setMemos])

  useEffect(() => {
    if (selectedMemoId) {
      const memo = memos.find(m => m.id === selectedMemoId)
      if (memo) {
        setHistory([memo.content])
        setHistoryIndex(0)
      }
    }
  }, [selectedMemoId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession.messages, isProcessing])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSource) {
        const newWidth = e.clientX
        setSourceWidth(Math.max(240, Math.min(500, newWidth)))
      }
    }
    const handleMouseUp = () => {
      setIsResizingSource(false)
    }
    if (isResizingSource) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingSource])

  // --- 세션(채팅방) 관련 핸들러 ---

  const handleNewChat = () => {
    const newSession: ChatSession = {
        id: Date.now().toString(),
        name: '새로운 채팅',
        messages: [],
        files: [],
        createdAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleSessionClick = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleSessionRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    if (session) {
        setEditingSessionId(id);
        setEditingSessionName(session.name);
    }
  };

  const handleSessionRenameSave = () => {
    if (editingSessionId && editingSessionName.trim()) {
        setSessions(prev => prev.map(s => 
            s.id === editingSessionId ? { ...s, name: editingSessionName.trim() } : s
        ));
        setEditingSessionId(null);
    }
  };

  // ✅ 채팅방 삭제 요청 (모달 열기)
  const handleSessionDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteSessionTargetId(id); // 삭제할 ID 설정 -> 모달 오픈
  };

  // ✅ 채팅방 삭제 확정 (모달에서 확인 눌렀을 때)
  const confirmSessionDelete = () => {
    if (!deleteSessionTargetId) return;

    const remaining = sessions.filter(s => s.id !== deleteSessionTargetId);
    setSessions(remaining);
    
    // 현재 보고 있던 채팅방을 삭제했으면 다른 방으로 이동
    if (currentSessionId === deleteSessionTargetId && remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
    } else if (remaining.length === 0) {
        handleNewChat();
    }
    setDeleteSessionTargetId(null); // 모달 닫기
  };


  // --- 파일 핸들러 ---
  
  const updateCurrentSessionFiles = (updater: (files: FileItem[]) => FileItem[]) => {
      setSessions(prev => prev.map(s => 
          s.id === currentSessionId ? { ...s, files: updater(s.files) } : s
      ));
  };

  const updateCurrentSessionMessages = (updater: (msgs: ChatMessage[]) => ChatMessage[]) => {
      setSessions(prev => prev.map(s => 
          s.id === currentSessionId ? { ...s, messages: updater(s.messages) } : s
      ));
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: FileItem[] = fileList.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      isSelected: true
    }))
    
    updateCurrentSessionFiles(prev => [...prev, ...newFiles]);

    if (newFiles.length > 0) {
      setIsProcessing(true)
      setTimeout(() => {
        const summaryMessage: ChatMessage = {
          id: Date.now(),
          text: `[자동 요약] 파일 "${newFiles[0].name}"에 대한 분석 결과입니다.\n\n이 문서는 ...에 대한 내용을 담고 있으며 주요 쟁점은 다음과 같습니다...`,
          isUser: false,
          timestamp: new Date(),
          isSummary: true,
          fileName: newFiles[0].name
        }
        updateCurrentSessionMessages(prev => [...prev, summaryMessage]);
        setIsProcessing(false)
      }, 1000)
    }
  };

  const handleFileAdd = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles);
  }

  const handleFileDelete = (fileId: string) => {
    updateCurrentSessionFiles(prev => prev.filter(f => f.id !== fileId));
  }

  const handleFileToggle = (fileId: string) => {
    updateCurrentSessionFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, isSelected: !f.isSelected } : f
    ));
  }

  // --- 채팅 핸들러 ---

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    }

    updateCurrentSessionMessages(prev => [...prev, userMessage]);
    setChatInput('')
    setIsProcessing(true)

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `"${chatInput}"에 대한 답변입니다.\n해당 내용은 문서의 3페이지 두 번째 문단에서 확인할 수 있습니다.`,
        isUser: false,
        timestamp: new Date()
      }
      updateCurrentSessionMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false)
    }, 1000)
  }

  // --- 메모 관련 핸들러 ---

  const handleAddToMemo = (content: string, titleHint?: string) => {
    if (!content) return

    if (selectedMemoId) {
      const selectedMemo = memos.find(m => m.id === selectedMemoId)
      if (selectedMemo) {
        updateMemo(selectedMemoId, {
          content: selectedMemo.content ? selectedMemo.content + '\n\n' + content : content
        })
      }
    } else {
      if (memos.length >= 10) {
          alert("메모는 최대 10개까지만 생성할 수 있습니다.");
          return;
      }
      const newMemo = {
        id: Date.now().toString(),
        title: titleHint || `메모 ${memos.length + 1}`,
        content: content
      }
      addMemo(newMemo)
      setSelectedMemoId(newMemo.id)
    }
  }

  const handleAddNewMemo = () => {
      if (memos.length >= 10) {
          alert("메모는 최대 10개까지만 생성할 수 있습니다.");
          return;
      }
      const newMemo = { id: Date.now().toString(), title: '새 메모', content: '' }
      addMemo(newMemo)
      setSelectedMemoId(newMemo.id)
  }

  const handleMemoClick = (memoId: string) => setSelectedMemoId(memoId)
  
  // ✅ 메모 삭제 요청 (모달 열기)
  const handleMemoDeleteClick = (id: string) => {
      setDeleteMemoTargetId(id);
  }

  // ✅ 메모 삭제 확정 (모달에서 확인)
  const confirmMemoDelete = () => {
      if (!deleteMemoTargetId) return;

      deleteMemo(deleteMemoTargetId);
      if (selectedMemoId === deleteMemoTargetId) {
          setSelectedMemoId(null);
      }
      setDeleteMemoTargetId(null); // 모달 닫기
  }

  const handleMemoNameEdit = () => {
    const selectedMemo = memos.find(m => m.id === selectedMemoId)
    if (selectedMemo) {
      setEditingMemoNameValue(selectedMemo.title)
      setEditingMemoName(true)
    }
  }

  const handleMemoNameSave = () => {
    if (selectedMemoId && editingMemoNameValue.trim()) {
      updateMemo(selectedMemoId, { title: editingMemoNameValue.trim() })
      setEditingMemoName(false)
    }
  }

  const handleMemoContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (selectedMemoId) {
      updateMemo(selectedMemoId, { content: newValue })
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  // --- 툴바 핸들러 ---
  const handleUndo = () => {
    if (historyIndex > 0 && selectedMemoId) {
      const prevContent = history[historyIndex - 1]
      updateMemo(selectedMemoId, { content: prevContent })
      setHistoryIndex(historyIndex - 1)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && selectedMemoId) {
      const nextContent = history[historyIndex + 1]
      updateMemo(selectedMemoId, { content: nextContent })
      setHistoryIndex(historyIndex + 1)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (selectedMemoId && textareaRef.current) {
        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const currentContent = textareaRef.current.value
        const newContent = currentContent.substring(0, start) + text + currentContent.substring(end)
        updateMemo(selectedMemoId, { content: newContent })
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
      alert("클립보드 내용을 읽을 수 없습니다. 브라우저 권한을 확인해주세요.");
    }
  }

  const wrapText = (wrapper: string) => {
    if (selectedMemoId && textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const currentContent = textareaRef.current.value
      const selectedText = currentContent.substring(start, end)
      const newContent = currentContent.substring(0, start) + `${wrapper}${selectedText}${wrapper}` + currentContent.substring(end)
      updateMemo(selectedMemoId, { content: newContent })
    }
  }

  const handleConvertToHWP = () => {
    const selectedMemo = memos.find(m => m.id === selectedMemoId)
    if (!selectedMemo) return
    const content = `제목: ${selectedMemo.title}\n\n내용:\n${selectedMemo.content}`
    const blob = new Blob([content], { type: 'application/hwp' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedMemo.title}.hwp`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleConvertToWord = () => {
    const selectedMemo = memos.find(m => m.id === selectedMemoId)
    if (!selectedMemo) return
    const htmlContent = `<html><head><meta charset="utf-8"><title>${selectedMemo.title}</title></head><body><h1>${selectedMemo.title}</h1><p style="white-space: pre-wrap;">${selectedMemo.content}</p></body></html>`
    const blob = new Blob([htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedMemo.title}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedFiles = currentSession.files.filter(f => f.isSelected)
  const selectedMemo = memos.find(m => m.id === selectedMemoId)

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden text-gray-900">
      <Header />
      
      {/* --- 모달 렌더링 --- */}
      <DeleteAlertModal 
        isOpen={!!deleteSessionTargetId} 
        onClose={() => setDeleteSessionTargetId(null)}
        onConfirm={confirmSessionDelete}
      />
      
      <MomoAlertModal 
        isOpen={!!deleteMemoTargetId} 
        onClose={() => setDeleteMemoTargetId(null)}
        onConfirm={confirmMemoDelete}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - Chat List & Source */}
        <div
          className="border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 z-10"
          style={{ width: `${sourceWidth}px` }}
        >
          {/* 1. 상단: 새 채팅 버튼 */}
          <div className="p-4 pb-2 flex-shrink-0">
             <button
                onClick={handleNewChat}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm text-sm font-medium"
             >
                <span>+</span>
                <span>새 채팅</span>
             </button>
          </div>

          {/* 2. 중단: 채팅 세션 리스트 */}
          <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
              <div className="text-xs font-semibold text-gray-400 mb-2 px-1">채팅 목록</div>
              <div className="space-y-1">
                  {sessions.map((session) => (
                      <div
                          key={session.id}
                          onClick={() => handleSessionClick(session.id)}
                          className={`group relative p-2.5 rounded-lg cursor-pointer transition-colors text-sm flex items-center ${
                              currentSessionId === session.id 
                                  ? 'bg-blue-100 text-blue-900 font-medium' 
                                  : 'text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                          <span className="mr-2">💬</span>
                          {editingSessionId === session.id ? (
                              <input
                                  type="text"
                                  value={editingSessionName}
                                  onChange={(e) => setEditingSessionName(e.target.value)}
                                  onBlur={handleSessionRenameSave}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSessionRenameSave()}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none text-xs"
                                  autoFocus
                              />
                          ) : (
                              <>
                                  <span className="truncate flex-1">{session.name}</span>
                                  {/* Hover 시 수정/삭제 버튼 표시 */}
                                  <div className="hidden group-hover:flex gap-1 absolute right-2 bg-inherit pl-1">
                                      <button onClick={(e) => handleSessionRename(session.id, e)} className="hover:text-blue-600 p-1">✏️</button>
                                      {/* ✅ 삭제 버튼 클릭 시 모달 호출 */}
                                      <button onClick={(e) => handleSessionDeleteClick(session.id, e)} className="hover:text-red-500 p-1">🗑️</button>
                                  </div>
                              </>
                          )}
                      </div>
                  ))}
              </div>
          </div>
          
          <div className="h-px bg-gray-200 mx-4 my-2"></div>

          {/* 3. 하단: 소스 (파일 목록) */}
          <div className="flex-shrink-0 flex flex-col p-4 pt-0 overflow-hidden" style={{ height: '40%' }}>
            <div className="mb-2 flex items-center justify-between">
               <h2 className="font-semibold text-gray-700">소스</h2>
               <span className="text-xs text-gray-500">{currentSession.files.length}개</span>
            </div>

            <div className="space-y-2 mb-2 flex-shrink-0">
                <button
                onClick={handleFileAdd}
                className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                파일 올리기
                </button>
                <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                />
            </div>
            
            <div 
                className={`flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar border-2 border-dashed rounded-lg transition-colors p-2 ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {currentSession.files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-xs">
                        <span className="text-2xl mb-1">📂</span>
                        <p>여기에 파일을 드래그하세요</p>
                    </div>
                ) : (
                    currentSession.files.map((file) => (
                        <div
                            key={file.id}
                            className={`flex items-center justify-between p-2 rounded border bg-white ${
                            file.isSelected ? 'border-blue-300 shadow-sm' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span>📄</span>
                            <span className="text-xs truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={file.isSelected}
                                onChange={() => handleFileToggle(file.id)}
                                className="cursor-pointer"
                            />
                            <button
                                onClick={() => handleFileDelete(file.id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                ×
                            </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>

        <div
          ref={sourceResizeRef}
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizingSource(true)
          }}
          className="w-1 bg-gray-200 cursor-ew-resize hover:bg-blue-400 transition-colors flex-shrink-0"
        />

        {/* Center Panel - Chat */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-gray-200">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {currentSession.messages.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-6xl mb-4 opacity-20">💬</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                    {currentSession.name}
                </h3>
                <p className="text-sm">왼쪽 하단 '소스'에 파일을 올려 대화를 시작하세요.</p>
              </div>
            )}

            {currentSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!msg.isSummary && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                            msg.isUser ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-gray-200'
                        }`}>
                            {msg.isUser ? '나' : 'AI'}
                        </div>
                    )}

                    <div
                    className={`relative p-4 rounded-2xl shadow-sm text-base leading-relaxed ${
                        msg.isSummary 
                            ? 'bg-blue-50 border border-blue-100 w-full ml-0' 
                            : msg.isUser 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 rounded-tl-none'
                    }`}
                    >
                    {msg.isSummary && (
                        <div className="font-bold text-blue-800 mb-2 pb-2 border-b border-blue-100 flex items-center gap-2">
                            <span>📑</span> 문서 분석 결과
                        </div>
                    )}

                    <p className={`whitespace-pre-wrap ${msg.isSummary ? 'text-gray-800' : ''}`}>
                        {msg.text}
                    </p>

                    {!msg.isUser && (
                        <div className="flex justify-end mt-3 pt-2">
                        <button
                            onClick={() => handleAddToMemo(msg.text, msg.fileName)}
                            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${
                                msg.isSummary 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <span>📝</span> 메모에 추가
                        </button>
                        </div>
                    )}
                    </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start gap-3">
                 <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 text-xs">AI</div>
                 <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="text-xs text-gray-400 ml-1">분석 중...</span>
                 </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 z-10">
            <form onSubmit={handleChatSend} className="max-w-4xl mx-auto relative flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="문서 내용에 대해 질문해보세요..."
                className="flex-1 pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isProcessing}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Memo */}
        <div className="w-80 bg-gray-50 p-4 flex-shrink-0 overflow-y-auto flex flex-col h-full border-l border-gray-200">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="font-semibold text-gray-800">메모장 <span className="text-xs font-normal text-gray-500">({memos.length}/10)</span></h3>
            <button 
              onClick={handleAddNewMemo}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="새 메모 추가"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>

          {/* 3. 메모 목록 크기 조정 (약 2개 보임) */}
          <div className="space-y-2 mb-4 flex-shrink-0 max-h-[110px] overflow-y-auto custom-scrollbar border-b pb-2">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  selectedMemoId === memo.id 
                    ? 'bg-white border-blue-500 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => handleMemoClick(memo.id)}
                  className="text-sm text-left flex-1 truncate font-medium text-gray-700"
                >
                  {memo.title}
                </button>
                <div className="flex items-center gap-1">
                  {/* ✅ 메모 삭제 버튼 클릭 시 모달 호출 */}
                  <button
                    onClick={() => handleMemoDeleteClick(memo.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedMemo ? (
            <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                {editingMemoName ? (
                  <input
                    type="text"
                    value={editingMemoNameValue}
                    onChange={(e) => setEditingMemoNameValue(e.target.value)}
                    onBlur={handleMemoNameSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleMemoNameSave()}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate">{selectedMemo.title}</span>
                    <button onClick={handleMemoNameEdit} className="text-gray-400 hover:text-gray-600">✎</button>
                  </div>
                )}
              </div>
              
              {/* 1. 메모 툴바 (붙여넣기 추가됨) */}
              <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white flex-wrap">
                <button onClick={handleUndo} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="실행 취소">↩</button>
                <button onClick={handleRedo} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="다시 실행">↪</button>
                <button onClick={handlePaste} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="붙여넣기">📋</button>
                
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                
                <button onClick={() => wrapText('**')} className="p-1.5 hover:bg-gray-100 rounded font-bold text-gray-600" title="굵게">B</button>
                <button onClick={() => wrapText('*')} className="p-1.5 hover:bg-gray-100 rounded italic text-gray-600" title="기울임">I</button>
                <button onClick={() => wrapText('- ')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="리스트">≡</button>
              </div>

              <textarea
                ref={textareaRef}
                value={selectedMemo.content}
                onChange={handleMemoContentChange}
                placeholder="메모 내용을 입력하세요..."
                className="flex-1 w-full p-4 resize-none focus:outline-none text-sm leading-relaxed"
              />

              <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button
                  onClick={handleConvertToHWP}
                  className="flex-1 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  HWP 저장
                </button>
                <button
                  onClick={handleConvertToWord}
                  className="flex-1 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  Word 저장
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              메모를 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentPage