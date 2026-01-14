import { useStore } from '../../store/useStore'
import undo from '../../assets/undo.png'
import redo from '../../assets/redo.png'
import copy from '../../assets/copy.png'
import burger from '../../assets/burger.png'

interface MemoPanelProps {
  selectedMemoId: string | null
  editingMemoName: boolean
  editingMemoNameValue: string
  setEditingMemoNameValue: (value: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onMemoClick: (memoId: string) => void
  onMemoDeleteClick: (id: string) => void
  onMemoNameEdit: () => void
  onMemoNameSave: () => void
  onMemoContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
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
  onPaste,
  onWrapText,
  onConvertToHWP,
  onConvertToWord,
  onTogglePanel,
  onOpenPanel,
  isRightPanelOpen,
  memoWidth
}: MemoPanelProps) => {
  const { memos } = useStore()
  const selectedMemo = memos.find(m => m.id === selectedMemoId)

  // 패널이 닫혔을 때 사이드바 열기 버튼만 표시
  if (!isRightPanelOpen) {
    return (
      <div className="bg-gray-50 border-l border-gray-200 flex-shrink-0 flex flex-col h-full transition-all duration-300 w-16">
        <div className="p-2 flex flex-col items-center gap-4 mt-4">
          <button 
            onClick={onOpenPanel}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
            title="메모장 열기"
          >
            <div className="inline-block p-1 rounded-full">
              <img 
                src={burger} 
                alt="burger" 
                className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
              />
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-gray-50 p-4 flex-shrink-0 overflow-y-auto flex flex-col h-full border-l border-gray-200 transition-all duration-300"
      style={{ width: `${memoWidth}px` }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={onTogglePanel}
            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
            title="메모장 접기"
          >
            <div className="inline-block p-1 rounded-full">
              <img 
                src={burger} 
                alt="burger" 
                className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
              />
            </div>
          </button>
          <h3 className="font-semibold text-gray-800">메모장 <span className="text-xs font-normal text-gray-500">({memos.length}/10)</span></h3>
        </div>
        
        <button 
          onClick={onAddNewMemo}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="새 메모 추가"
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>

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
              onClick={() => onMemoClick(memo.id)}
              className="text-sm text-left flex-1 truncate font-medium text-gray-700"
            >
              {memo.title}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onMemoDeleteClick(memo.id)}
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
                onBlur={onMemoNameSave}
                onKeyDown={(e) => e.key === 'Enter' && onMemoNameSave()}
                className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-semibold text-sm truncate">{selectedMemo.title}</span>
                <button onClick={onMemoNameEdit} className="text-gray-400 hover:text-gray-600">✎</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white flex-wrap">
            <button onClick={onUndo} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="실행 취소"><div className="inline-block p-1 rounded-full ">
            <img 
              src={undo} 
              alt="undo" 
              className="w-4 h-4 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div></button>
            <button onClick={onRedo} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="다시 실행">
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={redo} 
              alt="redo" 
              className="w-4 h-4 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
            </button>
            <button onClick={onPaste} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="붙여넣기">
            <div className="inline-block p-1 rounded-full ">
            <img 
              src={copy} 
              alt="copy" 
              className="w-4 h-4 object-contain justify-center items-center pt-1 opacity-60" 
            />
          </div>
            </button>
            
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            
            <button onClick={() => onWrapText('**')} className="p-1.5 hover:bg-gray-100 rounded font-bold text-gray-600" title="굵게">B</button>
            <button onClick={() => onWrapText('*')} className="p-1.5 hover:bg-gray-100 rounded italic text-gray-600" title="기울임">I</button>
            <button onClick={() => onWrapText('- ')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="리스트">≡</button>
          </div>

          <textarea
            ref={textareaRef}
            value={selectedMemo.content}
            onChange={onMemoContentChange}
            placeholder="메모 내용을 입력하세요..."
            className="flex-1 w-full p-4 resize-none focus:outline-none text-sm leading-relaxed"
          />

          <div className="p-2 bg-gray-50 border-t border-gray-100 flex gap-2">
            <button
              onClick={onConvertToHWP}
              className="flex-1 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              HWP 저장
            </button>
            <button
              onClick={onConvertToWord}
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
  )
}
