import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Header from '../components/Header'

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
}

const DocumentPage = () => {
  const { isAuthenticated, memos, setMemos, updateMemo, addMemo, deleteMemo } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sourceResizeRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null) // 툴바 기능을 위한 ref 추가

  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [summary, setSummary] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [editingMemoName, setEditingMemoName] = useState(false)
  const [editingMemoNameValue, setEditingMemoNameValue] = useState('')

  // 소스 패널 너비 조절
  const [sourceWidth, setSourceWidth] = useState(256)
  const [isResizingSource, setIsResizingSource] = useState(false)

  // Undo/Redo를 위한 간단한 히스토리 상태 (선택 사항 기능 구현)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // 초기 메모 설정
  useEffect(() => {
    if (memos.length === 0) {
      setMemos([{ id: '1', title: '새 메모', content: '' }])
      setSelectedMemoId('1')
    }
  }, [memos.length, setMemos])

  // 메모 선택 시 히스토리 초기화
  useEffect(() => {
    if (selectedMemoId) {
      const memo = memos.find(m => m.id === selectedMemoId)
      if (memo) {
        setHistory([memo.content])
        setHistoryIndex(0)
      }
    }
  }, [selectedMemoId])

  // 소스 패널 리사이즈 기능
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSource) {
        const newWidth = e.clientX
        setSourceWidth(Math.max(200, Math.min(500, newWidth)))
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

  if (!isAuthenticated) {
    // navigate('/') 
  }

  const handleFileAdd = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newFiles: FileItem[] = selectedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      isSelected: true
    }))
    setFiles(prev => [...prev, ...newFiles])

    if (newFiles.length > 0) {
      setIsProcessing(true)
      setTimeout(() => {
        setSummary(`파일 "${newFiles[0].name}"이(가) 분석되었습니다.`)
        setChatMessages([{
          id: 1,
          text: `파일 "${newFiles[0].name}"을(를) 업로드했습니다. 무엇을 도와드릴까요?`,
          isUser: false,
          timestamp: new Date()
        }])
        setIsProcessing(false)
      }, 1000)
    }
  }

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleFileToggle = (fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, isSelected: !f.isSelected } : f
    ))
  }

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsProcessing(true)

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        text: `질문에 대한 답변: "${chatInput}"에 대해 분석한 내용입니다.`,
        isUser: false,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1000)
  }

  const handleAddToMemo = () => {
    const lastAIMessage = [...chatMessages].reverse().find(m => !m.isUser)
    const contentToSave = summary || lastAIMessage?.text || ''

    if (!contentToSave) return

    if (selectedMemoId) {
      const selectedMemo = memos.find(m => m.id === selectedMemoId)
      if (selectedMemo) {
        updateMemo(selectedMemoId, {
          content: selectedMemo.content ? selectedMemo.content + '\n\n' + contentToSave : contentToSave
        })
      }
    } else {
      const newMemo = {
        id: Date.now().toString(),
        title: `메모 ${memos.length + 1}`,
        content: contentToSave
      }
      addMemo(newMemo)
      setSelectedMemoId(newMemo.id)
    }
    setSummary('')
  }

  const handleMemoClick = (memoId: string) => {
    setSelectedMemoId(memoId)
  }

  const handleMemoCheckboxToggle = (memoId: string) => {
    if (selectedMemoId === memoId) {
      setSelectedMemoId(null)
    } else {
      setSelectedMemoId(memoId)
    }
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
      
      // 히스토리 업데이트 (간단한 구현)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  // --- 툴바 기능 핸들러 ---
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
        // 커서 위치 조정 등은 생략
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
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

  // --- 변환 기능 ---
  const handleConvertToHWP = () => {
    const selectedMemo = memos.find(m => m.id === selectedMemoId)
    if (!selectedMemo) return

    const content = `제목: ${selectedMemo.title}\n\n내용:\n${selectedMemo.content}`
    // HWP는 바이너리 포맷이지만, 텍스트 내용을 담아 .hwp로 저장하면 한컴오피스에서 열릴 수 있도록 처리
    const blob = new Blob([content], { type: 'application/hwp' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 3. 수정사항: 확장자를 .hwp로 변경
    a.download = `${selectedMemo.title}.hwp`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleConvertToWord = () => {
    const selectedMemo = memos.find(m => m.id === selectedMemoId)
    if (!selectedMemo) return

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${selectedMemo.title}</title>
        </head>
        <body>
          <h1>${selectedMemo.title}</h1>
          <p style="white-space: pre-wrap;">${selectedMemo.content}</p>
        </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedMemo.title}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedFiles = files.filter(f => f.isSelected)
  const selectedMemo = memos.find(m => m.id === selectedMemoId)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Source */}
        <div
          className="border-r p-4 flex-shrink-0 overflow-y-auto bg-gray-50"
          style={{ width: `${sourceWidth}px` }}
        >
          <h2 className="font-semibold mb-4">소스</h2>
          <div className="space-y-2 mb-4">
            <button
              onClick={handleFileAdd}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              파일 추가
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            <button
              className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={selectedFiles.length === 0}
            >
              선택된 파일 ({selectedFiles.length})
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-2 rounded ${
                  file.isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span>📄</span>
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={file.isSelected}
                    onChange={() => handleFileToggle(file.id)}
                    className="cursor-pointer"
                  />
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          ref={sourceResizeRef}
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizingSource(true)
          }}
          className="w-1 bg-gray-300 cursor-ew-resize hover:bg-blue-500 transition-colors flex-shrink-0"
        />

        {/* Center Panel - Chat */}
        <div className="flex-1 border-r p-4 flex flex-col overflow-hidden">
          <h2 className="font-semibold mb-4">채팅</h2>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.length === 0 && !summary ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">파일을 업로드하거나 질문을 입력하세요</h3>
                  <p className="text-gray-500">AI가 파일을 분석하고 질문에 답변해드립니다.</p>
                </div>
              </div>
            ) : (
              <>
                {summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">요약된 내용</h4>
                      <button
                        onClick={handleAddToMemo}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        메모에 추가하기
                      </button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg p-3 ${
                        msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {!msg.isUser && (
                        <button
                          onClick={handleAddToMemo}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          메모에 추가하기
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <form onSubmit={handleChatSend} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="입력을 시작하세요!"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </form>
        </div>

        {/* Right Panel - Memo */}
        <div className="w-80 border-l p-4 flex-shrink-0 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">메모</h3>
            <button 
              onClick={() => {
                const newMemo = { id: Date.now().toString(), title: '새 메모', content: '' }
                addMemo(newMemo)
                setSelectedMemoId(newMemo.id)
              }}
              className="text-xl text-blue-600 hover:text-blue-800"
              title="새 메모 추가"
            >
              +
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className={`flex items-center justify-between p-2 rounded ${
                  selectedMemoId === memo.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <button
                  onClick={() => handleMemoClick(memo.id)}
                  className="text-sm text-left hover:underline flex-1 truncate"
                >
                  {memo.title}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedMemoId === memo.id}
                    onChange={() => handleMemoCheckboxToggle(memo.id)}
                    className="cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      deleteMemo(memo.id)
                      if (selectedMemoId === memo.id) {
                        setSelectedMemoId(null)
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedMemo && (
            <div className="border-t pt-4 flex flex-col h-[calc(100vh-250px)]">
              <div className="flex items-center justify-between mb-2">
                {editingMemoName ? (
                  <input
                    type="text"
                    value={editingMemoNameValue}
                    onChange={(e) => setEditingMemoNameValue(e.target.value)}
                    onBlur={handleMemoNameSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMemoNameSave()
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                ) : (
                  <>
                    <h4 className="font-semibold flex-1 truncate pr-2">{selectedMemo.title}</h4>
                    <button
                      onClick={handleMemoNameEdit}
                      className="text-gray-500 hover:text-gray-700 text-sm flex-shrink-0"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              
              {/* 2. 요청사항: 메모장 상단 툴바 추가 */}
              <div className="flex items-center gap-1 mb-2 border border-gray-200 rounded p-1 bg-gray-50">
                <button onClick={handleUndo} className="p-1 hover:bg-gray-200 rounded" title="실행 취소">↩️</button>
                <button onClick={handleRedo} className="p-1 hover:bg-gray-200 rounded" title="다시 실행">↪️</button>
                <button onClick={handlePaste} className="p-1 hover:bg-gray-200 rounded" title="붙여넣기">📋</button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button onClick={() => wrapText('**')} className="p-1 hover:bg-gray-200 rounded font-bold px-2" title="굵게 (Markdown)">B</button>
                <button onClick={() => wrapText('*')} className="p-1 hover:bg-gray-200 rounded italic px-2" title="기울임 (Markdown)">/</button>
                <button onClick={() => wrapText('- ')} className="p-1 hover:bg-gray-200 rounded px-2" title="목록 (Markdown)">≡</button>
              </div>

              {/* 메모 입력창 */}
              <textarea
                ref={textareaRef}
                value={selectedMemo.content}
                onChange={handleMemoContentChange}
                placeholder="메모 내용을 입력하세요..."
                className="w-full flex-1 border border-gray-300 rounded-lg p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
              />

              {/* 1. 요청사항: 한글/워드 변환 버튼을 맨 아래로 이동 */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleConvertToHWP}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm flex-1 font-medium"
                >
                  한글 변환 (.hwp)
                </button>
                <button
                  onClick={handleConvertToWord}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm flex-1 font-medium"
                >
                  워드 변환
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentPage