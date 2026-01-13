import { useState, useEffect, useRef } from 'react'
import { ChatMessage, FileItem } from './useChatSessions'

interface UseChatProps {
  currentSessionFiles: FileItem[]
  updateCurrentSessionMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void
  setIsProcessing: (value: boolean) => void
}

export const useChat = ({
  currentSessionFiles,
  updateCurrentSessionMessages,
  setIsProcessing
}: UseChatProps) => {
  const [chatInput, setChatInput] = useState('')
  // [수정 2] 로딩 상태 변수명 혼동 방지를 위해 local prefix 유지 (좋은 패턴)
  const [isProcessingLocal, setIsProcessingLocal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤 - 메시지가 추가되거나 처리 중일 때
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isProcessingLocal])

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // [체크] FileItem 인터페이스에 isSelected 속성이 있는지 확인 필요
    const selectedFiles = currentSessionFiles.filter(f => f.isSelected)
    
    // 디버깅용 로그
    const contextData = selectedFiles.map(f => ({
      id: f.id,
      name: f.name,
    }))
    console.log("선택된 파일:", contextData)

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    }

    // 사용자 메시지 추가
    updateCurrentSessionMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsProcessingLocal(true)
    setIsProcessing(true)

    // AI 응답 시뮬레이션
    setTimeout(() => {
      let aiResponseText = `"${userMessage.text}"에 대한 답변입니다.\n`
      
      if (selectedFiles.length > 0) {
        const fileNames = selectedFiles.map(f => f.name).join(', ')
        aiResponseText = `선택하신 파일 [${fileNames}]의 내용을 바탕으로 답변드립니다.\n\n` + aiResponseText
        aiResponseText += "해당 파일의 내용과 채팅 내용을 종합하여 분석하였습니다."
      } else {
        aiResponseText += "일반적인 법률 지식에 기반하여 답변드립니다."
      }

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      }

      // AI 메시지 추가
      updateCurrentSessionMessages(prev => [...prev, aiMessage])
      setIsProcessingLocal(false)
      setIsProcessing(false)
    }, 1000)
  }

  return {
    chatInput,
    setChatInput,
    isProcessing: isProcessingLocal,
    chatEndRef,
    handleChatSend
  }
}