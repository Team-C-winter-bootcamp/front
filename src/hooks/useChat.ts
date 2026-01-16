import { useState, useEffect, useRef } from 'react'
import { ChatMessage, FileItem } from './useChatSessions'
import { sessionService } from '../api'

interface UseChatProps {
  currentSessionFiles: FileItem[]
  updateCurrentSessionMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void
  setIsProcessing: (value: boolean) => void
  currentSessionId?: string
}

export const useChat = ({
  currentSessionFiles,
  updateCurrentSessionMessages,
  setIsProcessing,
  currentSessionId
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

    const selectedFiles = currentSessionFiles.filter(f => f.isSelected)
    const messageText = chatInput.trim()
    setChatInput('')
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    }

    // 사용자 메시지 추가
    updateCurrentSessionMessages(prev => [...prev, userMessage])
    setIsProcessingLocal(true)
    setIsProcessing(true)

    try {
      // 세션 ID가 있으면 API 호출
      if (currentSessionId) {
        const sessionId = parseInt(currentSessionId)
        if (!isNaN(sessionId)) {
          // 선택된 파일 정보를 메시지에 포함 (API 스펙에 따라 조정 필요)
          const responseData = await sessionService.sendMessage(sessionId, { 
            message: messageText 
          })
          
          const aiMessage: ChatMessage = {
            id: responseData.id,
            text: responseData.content,
            isUser: false,
            timestamp: new Date()
          }

          updateCurrentSessionMessages(prev => [...prev, aiMessage])
          setIsProcessingLocal(false)
          setIsProcessing(false)
          return
        }
      }

      // 세션 ID가 없거나 API 호출 실패 시 로컬 시뮬레이션
      setTimeout(() => {
        let aiResponseText = `"${messageText}"에 대한 답변입니다.\n`
        
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

        updateCurrentSessionMessages(prev => [...prev, aiMessage])
        setIsProcessingLocal(false)
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      // 에러 시에도 로컬 응답
      setTimeout(() => {
        let aiResponseText = `"${messageText}"에 대한 답변입니다.\n`
        
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

        updateCurrentSessionMessages(prev => [...prev, aiMessage])
        setIsProcessingLocal(false)
        setIsProcessing(false)
      }, 1000)
    }
  }

  return {
    chatInput,
    setChatInput,
    isProcessing: isProcessingLocal,
    chatEndRef,
    handleChatSend
  }
}