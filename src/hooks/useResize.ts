import { useState, useEffect, useRef } from 'react'

export const useResize = () => {
  const sourceResizeRef = useRef<HTMLDivElement>(null)
  const memoResizeRef = useRef<HTMLDivElement>(null)
  const fileDividerResizeRef = useRef<HTMLDivElement>(null)
  const leftSidebarRef = useRef<HTMLDivElement>(null)
  const [sourceWidth, setSourceWidth] = useState(280)
  const [memoWidth, setMemoWidth] = useState(320)
  const [fileAreaHeight, setFileAreaHeight] = useState(350) // 파일 영역 높이 (px) - 드래그 영역(200px) + 상단 영역 포함
  const [isResizingSource, setIsResizingSource] = useState(false)
  const [isResizingMemo, setIsResizingMemo] = useState(false)
  const [isResizingFileDivider, setIsResizingFileDivider] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSource) {
        const newWidth = e.clientX
        setSourceWidth(Math.max(240, Math.min(500, newWidth)))
      }
      if (isResizingMemo) {
        const newWidth = window.innerWidth - e.clientX
        setMemoWidth(Math.max(280, Math.min(600, newWidth)))
      }
      if (isResizingFileDivider && leftSidebarRef.current) {
        const sidebarRect = leftSidebarRef.current.getBoundingClientRect()
        const sidebarHeight = sidebarRect.height
        const headerHeight = 80 // 상단 버튼 영역 높이 (대략)
        const availableHeight = sidebarHeight - headerHeight
        
        // 마우스 Y 위치를 기준으로 파일 영역 높이 계산
        const mouseYRelative = e.clientY - sidebarRect.top - headerHeight
        const newFileAreaHeight = availableHeight - mouseYRelative
        
        // 최소 높이: 드래그 영역 높이(200px) + 상단 영역(헤더 30px + 버튼 50px + 여유 20px) = 300px
        // 드래그 영역이 항상 보이도록 보장
        const minFileAreaHeight = 300
        // 최대 높이는 사용 가능한 높이의 80% 정도
        const maxFileAreaHeight = availableHeight * 0.8
        
        // 구분선이 드래그 영역 아래로 내려가지 않도록 제한
        const constrainedHeight = Math.max(minFileAreaHeight, Math.min(maxFileAreaHeight, newFileAreaHeight))
        setFileAreaHeight(constrainedHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizingSource(false)
      setIsResizingMemo(false)
      setIsResizingFileDivider(false)
    }

    if (isResizingSource || isResizingMemo || isResizingFileDivider) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingSource, isResizingMemo, isResizingFileDivider])

  return {
    sourceResizeRef,
    memoResizeRef,
    fileDividerResizeRef,
    leftSidebarRef,
    sourceWidth,
    memoWidth,
    fileAreaHeight,
    setIsResizingSource,
    setIsResizingMemo,
    setIsResizingFileDivider
  }
}
