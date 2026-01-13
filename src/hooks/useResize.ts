import { useState, useEffect, useRef } from 'react'

export const useResize = () => {
  const sourceResizeRef = useRef<HTMLDivElement>(null)
  const memoResizeRef = useRef<HTMLDivElement>(null)
  const [sourceWidth, setSourceWidth] = useState(280)
  const [memoWidth, setMemoWidth] = useState(320)
  const [isResizingSource, setIsResizingSource] = useState(false)
  const [isResizingMemo, setIsResizingMemo] = useState(false)

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
    }

    const handleMouseUp = () => {
      setIsResizingSource(false)
      setIsResizingMemo(false)
    }

    if (isResizingSource || isResizingMemo) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingSource, isResizingMemo])

  return {
    sourceResizeRef,
    memoResizeRef,
    sourceWidth,
    memoWidth,
    setIsResizingSource,
    setIsResizingMemo
  }
}
