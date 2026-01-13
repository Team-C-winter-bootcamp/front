import { useState, useRef } from 'react'
import { FileItem, ChatMessage } from './useChatSessions'

interface UseFileManagementProps {
  updateCurrentSessionFiles: (updater: (files: FileItem[]) => FileItem[]) => void
  updateCurrentSessionMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void
  setIsProcessing: (value: boolean) => void
}

export const useFileManagement = ({
  updateCurrentSessionFiles,
  updateCurrentSessionMessages,
  setIsProcessing
}: UseFileManagementProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState('')
  const [deleteFileTargetId, setDeleteFileTargetId] = useState<string | null>(null)

  const processFiles = (fileList: File[]) => {
    const newFiles: FileItem[] = fileList.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
      isSelected: true
    }))
    
    updateCurrentSessionFiles(prev => [...prev, ...newFiles])

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
        updateCurrentSessionMessages(prev => [...prev, summaryMessage])
        setIsProcessing(false)
      }, 1000)
    }
  }

  const handleFileAdd = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }

  const handleFileDeleteClick = (fileId: string) => {
    setDeleteFileTargetId(fileId)
  }

  const confirmFileDelete = () => {
    if (deleteFileTargetId) {
      updateCurrentSessionFiles(prev => prev.filter(f => f.id !== deleteFileTargetId))
    }
    setDeleteFileTargetId(null)
  }

  const handleFileRenameClick = (fileId: string, currentName: string) => {
    setEditingFileId(fileId)
    setEditingFileName(currentName)
  }

  const handleFileRenameSave = () => {
    if (editingFileId && editingFileName.trim()) {
      updateCurrentSessionFiles(prev => prev.map(f => 
        f.id === editingFileId ? { ...f, name: editingFileName.trim() } : f
      ))
    }
    setEditingFileId(null)
  }

  const handleFileToggle = (fileId: string) => {
    updateCurrentSessionFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, isSelected: !f.isSelected } : f
    ))
  }

  return {
    fileInputRef,
    isDragging,
    editingFileId,
    editingFileName,
    setEditingFileName,
    deleteFileTargetId,
    setDeleteFileTargetId,
    handleFileAdd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleFileDeleteClick,
    confirmFileDelete,
    handleFileRenameClick,
    handleFileRenameSave,
    handleFileToggle
  }
}
