import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

export const useMemoManagement = () => {
  const { memos, setMemos, updateMemo, addMemo, deleteMemo } = useStore()
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [editingMemoName, setEditingMemoName] = useState(false)
  const [editingMemoNameValue, setEditingMemoNameValue] = useState('')
  const [deleteMemoTargetId, setDeleteMemoTargetId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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
  }, [selectedMemoId, memos])

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
        alert("메모는 최대 10개까지만 생성할 수 있습니다.")
        return
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
      alert("메모는 최대 10개까지만 생성할 수 있습니다.")
      return
    }
    const newMemo = { id: Date.now().toString(), title: '새 메모', content: '' }
    addMemo(newMemo)
    setSelectedMemoId(newMemo.id)
  }

  const handleMemoClick = (memoId: string) => setSelectedMemoId(memoId)
  
  const handleMemoDeleteClick = (id: string) => {
    setDeleteMemoTargetId(id)
  }

  const confirmMemoDelete = () => {
    if (!deleteMemoTargetId) return

    deleteMemo(deleteMemoTargetId)
    if (selectedMemoId === deleteMemoTargetId) {
      setSelectedMemoId(null)
    }
    setDeleteMemoTargetId(null)
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
      alert("클립보드 내용을 읽을 수 없습니다. 브라우저 권한을 확인해주세요.")
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

  const selectedMemo = memos.find(m => m.id === selectedMemoId)

  return {
    memos,
    selectedMemoId,
    selectedMemo,
    editingMemoName,
    editingMemoNameValue,
    setEditingMemoNameValue,
    deleteMemoTargetId,
    setDeleteMemoTargetId,
    textareaRef,
    handleAddToMemo,
    handleAddNewMemo,
    handleMemoClick,
    handleMemoDeleteClick,
    confirmMemoDelete,
    handleMemoNameEdit,
    handleMemoNameSave,
    handleMemoContentChange,
    handleUndo,
    handleRedo,
    handlePaste,
    wrapText,
    handleConvertToHWP,
    handleConvertToWord
  }
}
