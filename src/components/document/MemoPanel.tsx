import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from '../../store/useStore'
import undo from '../../assets/undo.png'
import redo from '../../assets/redo.png'
import copy from '../../assets/copy.png'
import burger from '../../assets/burger.png'
import b from '../../assets/b.png'
import I from '../../assets/I.png'

interface MemoPanelProps {
  selectedMemoId: string | null
  editingMemoName: boolean
  editingMemoNameValue: string
  setEditingMemoNameValue: (value: string) => void
  textareaRef: React.RefObject<HTMLDivElement>
  onMemoClick: (memoId: string) => void
  onMemoDeleteClick: (id: string) => void
  onMemoNameEdit: () => void
  onMemoNameSave: () => void
  onMemoContentChange: (e: any) => void
  onAddNewMemo: () => void
  onUndo: () => void
  onRedo: () => void
  onPaste: () => void
  onWrapText: (wrapper: string) => void
  onConvertToHWP: () => void
  onConvertToWord: () => void
  onTogglePanel: () => void
  onOpenPanel: () => void
  isRightPanelOpen: boolean
  memoWidth: number
}

export const MemoPanel = ({
  selectedMemoId,
  editingMemoName,
  editingMemoNameValue,
  setEditingMemoNameValue,
  textareaRef,
  onMemoClick,
  onMemoDeleteClick,
  onMemoNameEdit,
  onMemoNameSave,
  onMemoContentChange,
  onAddNewMemo,
  onUndo,
  onRedo,
  onConvertToHWP,
  onConvertToWord,
  onTogglePanel,
  onOpenPanel,
  isRightPanelOpen,
  memoWidth
}: MemoPanelProps) => {
  const { memos } = useStore()
  const selectedMemo = memos.find(m => m.id === selectedMemoId)

  // --- [추가됨] 리사이징 관련 State ---
  const [memoListHeight, setMemoListHeight] = useState(110); // 초기 높이 (기존 max-h 값과 비슷하게 설정)
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(false); // 이벤트 리스너 내부에서 최신 상태 참조용

  useEffect(() => {
    if (textareaRef.current && selectedMemo) {
      if (textareaRef.current.innerHTML !== selectedMemo.content) {
        textareaRef.current.innerHTML = selectedMemo.content
      }
    }
  }, [selectedMemoId, selectedMemo, textareaRef])

  // --- [추가됨] 리사이징 로직 ---
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizingRef.current = true;
    document.body.style.cursor = 'row-resize'; // 드래그 중 커서 변경
    document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    resizingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (resizingRef.current) {
      // movementY를 사용하여 증감 계산
      setMemoListHeight((prevHeight) => {
        const newHeight = prevHeight + e.movementY;
        // 최소 높이: 60px (약 1개), 최대 높이: 240px (약 4개)
        if (newHeight < 60) return 60;
        if (newHeight > 240) return 240;
        return newHeight;
      });
    }
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  // ---------------------------------

  const triggerChange = () => {
    if (textareaRef.current) {
      const content = textareaRef.current.innerHTML;
      onMemoContentChange({
        target: { value: content },
        currentTarget: { value: content }
      });
    }
  }

  const applyStyle = (e: React.MouseEvent, command: string) => {
    e.preventDefault();
    document.execCommand(command, false);
    textareaRef.current?.focus();
    triggerChange();
  };

  const handlePasteOnDiv = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    triggerChange();
  };

  const handleToolbarPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      textareaRef.current?.focus();
      document.execCommand('insertText', false, text);
      triggerChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('클립보드 접근 권한이 필요합니다.');
    }
  };

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onMemoContentChange({
      target: { value: content },
      currentTarget: { value: content }
    });
  };

  if (!isRightPanelOpen) {
    return (
      <div className="bg-[#F5F3EB] border-l border-minimal-gray flex-shrink-0 flex flex-col h-full transition-all duration-300 w-16 font-serif">
        <div className="p-2 flex flex-col items-center gap-4 mt-4">
          <button onClick={onOpenPanel} className="p-2 hover:bg-[#E8E0D0] rounded-minimal text-minimal-medium-gray transition-colors" title="메모장 열기">
            <div className="inline-block p-1 rounded-full">
              <img src={burger} alt="burger" className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-50" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-[#F5F3EB] p-4 flex-shrink-0 overflow-hidden flex flex-col h-full border-l border-minimal-gray transition-all duration-300 font-serif"
      style={{ width: `${memoWidth}px` }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onTogglePanel} className="p-2 hover:bg-[#E8E0D0] rounded-minimal text-minimal-medium-gray transition-colors" title="메모장 접기">
            <div className="inline-block p-1 rounded-full">
              <img src={burger} alt="burger" className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-50" />
            </div>
          </button>
          <h3 className="font-light text-minimal-charcoal">메모장 <span className="text-xs font-light text-minimal-medium-gray">({memos.length}/10)</span></h3>
        </div>
        <button onClick={onAddNewMemo} className="p-1 text-minimal-dark-gray hover:bg-[#E8E0D0] rounded-minimal transition-colors" title="새 메모 추가">
          <span className="text-lg font-light">+</span>
        </button>
      </div> 

      {/* 메모 리스트 영역 */}
      <div 
        className="space-y-2 flex-shrink-0 overflow-y-auto custom-scrollbar"
        style={{ height: `${memoListHeight}px` }}
      >
        {memos.map((memo) => (
          <div
            key={memo.id}
            className={`flex items-center justify-between p-2 rounded-minimal border transition-all ${
              selectedMemoId === memo.id 
                ? 'bg-[#E8E0D0] border-[#CFB982] shadow-minimal' 
                : 'bg-[#F5F3EB] border border-[#CFB982] hover:border-[#C8A45D] shadow-minimal'
            }`}
          >
            <button onClick={() => onMemoClick(memo.id)} className="text-sm text-left flex-1 truncate font-light text-minimal-charcoal">
              {memo.title || memo.content.replace(/<[^>]*>?/gm, '') || '새 메모'}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => onMemoDeleteClick(memo.id)} className="text-minimal-medium-gray hover:text-minimal-charcoal p-1 transition-colors">×</button>
            </div>
          </div>
        ))}
      </div>

     {/* 드래그 핸들바 */}
     <div 
        onMouseDown={startResizing}
        className="group cursor-row-resize flex items-center justify-center h-4 -mx-4 hover:bg-[#F5F3EB] transition-colors my-1 select-none"
      >
        <div className="w-14 h-1 bg-[#F5F3EB] rounded-full group-hover:bg-gray-400 transition-colors"></div>
      </div>

      {selectedMemo ? (
        <div className="flex flex-col flex-1 min-h-0 bg-[#F5F3EB] border border-[#F5F3EB] rounded-lg shadow-minimal overflow-hidden">
          <div className="p-3 border-b border-[F5F3EB] flex items-center justify-between bg-[#F5F3EB]">
            {editingMemoName ? (
              <input
                type="text"
                value={editingMemoNameValue}
                onChange={(e) => setEditingMemoNameValue(e.target.value)}
                onBlur={onMemoNameSave}
                onKeyDown={(e) => e.key === 'Enter' && onMemoNameSave()}
                className="flex-1 px-2 py-1 border border-minimal-charcoal rounded-minimal text-sm focus:outline-none focus:ring-1 focus:ring-minimal-charcoal bg-[#F5F3EB]"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-light text-sm truncate text-minimal-charcoal">{selectedMemo.title}</span>
                <button onClick={onMemoNameEdit} className="text-minimal-medium-gray hover:text-minimal-charcoal transition-colors">✎</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 p-2 border-b border-minimal-gray bg-[#F5F3EB] flex-wrap">
            <button onClick={onUndo} className="p-1.5 hover:bg-[#E8E0D0] rounded-minimal text-minimal-dark-gray transition-colors" title="실행 취소">
               <div className="inline-block p-1 rounded-full"><img src={undo} alt="undo" className="w-3 h-3 object-contain opacity-50" /></div>
            </button>
            <button onClick={onRedo} className="p-1.5 hover:bg-[#E8E0D0] rounded-minimal text-minimal-dark-gray transition-colors" title="다시 실행">
               <div className="inline-block p-1 rounded-full"><img src={redo} alt="redo" className="w-3 h-3 object-contain opacity-50" /></div>
            </button>
            <button onClick={handleToolbarPaste} className="p-1.5 hover:bg-[#E8E0D0] rounded-minimal text-minimal-dark-gray transition-colors" title="붙여넣기">
               <div className="inline-block p-1 rounded-full"><img src={copy} alt="copy" className="w-3 h-3 object-contain opacity-50" /></div>
            </button>
            
            <div className="w-px h-4 bg-minimal-gray mx-1"></div>
            
            <button onMouseDown={(e) => applyStyle(e, 'bold')} className="p-1.5 hover:bg-[#E8E0D0] rounded-minimal font-medium text-minimal-dark-gray transition-colors" title="굵게">
            <div className="inline-block p-1 rounded-full"><img src={b} alt="bold" className="w-3 h-3 object-contain opacity-50" /></div>
            </button>
            <button onMouseDown={(e) => applyStyle(e, 'italic')} className="p-1.5 hover:bg-[#E8E0D0] rounded-minimal italic text-minimal-dark-gray transition-colors" title="기울임">
            <div className="inline-block p-1 rounded-full"><img src={I} alt="i" className="w-3 h-3 object-contain opacity-50" /></div>
            </button>
          </div>

          <div
            ref={textareaRef}
            contentEditable={true}
            onInput={handleContentInput}
            onPaste={handlePasteOnDiv}
            className="flex-1 w-full p-4 focus:outline-none text-sm leading-relaxed overflow-y-auto custom-scrollbar bg-[#F5F3EB] text-minimal-charcoal font-light"
            suppressContentEditableWarning={true}
          />

          <div className="p-2 bg-[#F5F3EB] border-t border-minimal-gray flex gap-2">
            <button onClick={onConvertToHWP} className="flex-1 text-xs font-light px-4 py-2 bg-[#F5F3EB] border border-[#CFB982] rounded-lg text-minimal-charcoal hover:bg-[#E8E0D0] transition-all">
              HWP 저장
            </button>
            <button onClick={onConvertToWord} className="flex-1 text-xs font-light px-4 py-2 bg-[#F5F3EB] border border-[#CFB982] rounded-lg text-minimal-charcoal hover:bg-[#E8E0D0] transition-all">
              Word 저장
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-minimal-medium-gray text-sm font-light">
          메모를 선택하세요
        </div>
      )}
    </div>
  )
}