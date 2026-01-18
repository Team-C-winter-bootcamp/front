import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

export const useMemoManagement = () => {
  const { memos, setMemos, updateMemo, addMemo, deleteMemo } = useStore()
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null)
  const [editingMemoName, setEditingMemoName] = useState(false)
  const [editingMemoNameValue, setEditingMemoNameValue] = useState('')
  const [deleteMemoTargetId, setDeleteMemoTargetId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isUndoRedoRef = useRef(false) // undo/redo 중인지 추적

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
        // 메모 선택 시 히스토리 초기화
        setHistory([memo.content])
        setHistoryIndex(0)
        isUndoRedoRef.current = false
      }
    }
  }, [selectedMemoId])

  const handleAddToMemo = (content: string, titleHint?: string) => {
    if (!content) return

    if (selectedMemoId) {
      const selectedMemo = memos.find(m => m.id === selectedMemoId)
      if (selectedMemo) {
        // 기존 메모 내용이 있는 경우
        if (selectedMemo.content && selectedMemo.content.trim()) {
          // 기존 내용 끝의 줄바꿈을 제거하고, \n\n으로 구분하여 추가
          const trimmedContent = selectedMemo.content.replace(/\n+$/, '')
          updateMemo(selectedMemoId, {
            content: trimmedContent + '\n\n' + content
          })
        } else {
          // 기존 내용이 비어있거나 공백만 있는 경우 줄바꿈 없이 추가
          updateMemo(selectedMemoId, {
            content: content
          })
        }
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

  const handleMemoContentChange = (e: any) => {
    const newValue = e.target?.value || e.currentTarget?.innerHTML || ''
    if (selectedMemoId) {
      updateMemo(selectedMemoId, { content: newValue })
      
      // undo/redo로 인한 변경이 아닐 때만 히스토리에 추가
      if (!isUndoRedoRef.current) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(newValue)
        // 히스토리 크기 제한 (최대 50개)
        if (newHistory.length > 50) {
          newHistory.shift()
        } else {
          setHistoryIndex(newHistory.length - 1)
        }
        setHistory(newHistory)
      } else {
        // undo/redo 후에는 플래그 리셋
        isUndoRedoRef.current = false
      }
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0 && selectedMemoId) {
      const prevContent = history[historyIndex - 1]
      const newIndex = historyIndex - 1
      isUndoRedoRef.current = true
      setHistoryIndex(newIndex)
      updateMemo(selectedMemoId, { content: prevContent })
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && selectedMemoId) {
      const nextContent = history[historyIndex + 1]
      const newIndex = historyIndex + 1
      isUndoRedoRef.current = true
      setHistoryIndex(newIndex)
      updateMemo(selectedMemoId, { content: nextContent })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (selectedMemoId && textareaRef.current) {
        textareaRef.current.focus()
        document.execCommand('insertText', false, text)
        // contentEditable div의 내용을 업데이트
        if (textareaRef.current) {
          const content = textareaRef.current.innerHTML
          updateMemo(selectedMemoId, { content })
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
      alert("클립보드 내용을 읽을 수 없습니다. 브라우저 권한을 확인해주세요.")
    }
  }

  const wrapText = (wrapper: string) => {
    if (selectedMemoId && textareaRef.current) {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return
      
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      // 선택 영역 앞뒤의 텍스트를 확인하여 이미 wrapper로 감싸져 있는지 체크
      const beforeRange = range.cloneRange()
      beforeRange.setStart(range.startContainer, Math.max(0, range.startOffset - wrapper.length))
      beforeRange.setEnd(range.startContainer, range.startOffset)
      const beforeText = beforeRange.toString()
      
      const afterRange = range.cloneRange()
      afterRange.setStart(range.endContainer, range.endOffset)
      afterRange.setEnd(range.endContainer, Math.min(
        range.endContainer.nodeType === Node.TEXT_NODE 
          ? (range.endContainer as Text).length 
          : range.endContainer.childNodes.length,
        range.endOffset + wrapper.length
      ))
      const afterText = afterRange.toString()
      
      // 이미 wrapper로 감싸져 있는지 확인
      const isWrapped = beforeText === wrapper && afterText === wrapper
      
      if (isWrapped) {
        // 이미 감싸져 있으면 제거
        beforeRange.deleteContents()
        afterRange.deleteContents()
        range.insertNode(document.createTextNode(selectedText))
      } else {
        // 감싸져 있지 않으면 추가
        const wrapperBefore = document.createTextNode(wrapper)
        const wrapperAfter = document.createTextNode(wrapper)
        range.insertNode(wrapperAfter)
        range.insertNode(document.createTextNode(selectedText))
        range.insertNode(wrapperBefore)
      }
      
      // contentEditable div의 내용을 업데이트
      if (textareaRef.current) {
        const content = textareaRef.current.innerHTML
        updateMemo(selectedMemoId, { content })
      }
      
      isUndoRedoRef.current = false
      textareaRef.current.focus()
      
      // input 이벤트 발생시켜서 상태 동기화
      const event = new Event('input', { bubbles: true })
      textareaRef.current.dispatchEvent(event)
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
