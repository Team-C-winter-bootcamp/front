import { FileItem } from '../../hooks/useChatSessions'
import { Pencil, X } from 'lucide-react'

interface FileListProps {
  files: FileItem[]
  editingFileId: string | null
  editingFileName: string
  setEditingFileName: (name: string) => void
  isDragging: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileAdd: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileDeleteClick: (fileId: string) => void
  onFileRenameClick: (fileId: string, currentName: string) => void
  onFileRenameSave: () => void
  onFileToggle: (fileId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export const FileList = ({
  files,
  editingFileId,
  editingFileName,
  setEditingFileName,
  isDragging,
  fileInputRef,
  onFileAdd,
  onFileChange,
  onFileDeleteClick,
  onFileRenameClick,
  onFileRenameSave,
  onFileToggle,
  onDragOver,
  onDragLeave,
  onDrop
}: FileListProps) => {
  return (
    <div className="h-full flex flex-col p-5 pt-0 overflow-hidden bg-white text-slate-700">
      <div className="mb-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-medium text-slate-800 text-sm tracking-wide">소스</h2>
        <span className="text-xs text-slate-500 font-light">{files.length}개</span>
      </div>

      <div className="space-y-2 mb-3 flex-shrink-0">
        <button
          onClick={onFileAdd}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm font-medium"
        >
          파일 올리기
        </button>
        <input
          ref={fileInputRef}
          type="file" 
          multiple
          onChange={onFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />
      </div>
      
      {/* 파일이 없을 때만 드래그 영역 표시 */}
      {files.length === 0 ? (
        <div 
          className={`flex-shrink-0 border border-dashed rounded-xl transition-all duration-200 p-2 flex items-center justify-center ${
            isDragging 
              ? 'border-indigo-400 bg-indigo-50' 
              : 'border-slate-300 bg-slate-50'
          }`}
          style={{ height: '200px' }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-center text-slate-500 text-xs font-light">
            <span className="text-2xl mb-1 block"></span>
            <p>여기에 파일을 드래그하세요</p>
          </div>
        </div>
      ) : (
        /* 파일 목록: 파일이 있으면 드래그 영역 위치에 파일 목록 표시 */
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-xl group transition-all duration-200 bg-white border shadow-sm ${
                file.isSelected 
                  ? 'border-indigo-300 ring-1 ring-indigo-100' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {editingFileId === file.id ? (
                  <input 
                    type="text"
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                    onBlur={onFileRenameSave}
                    onKeyDown={(e) => e.key === 'Enter' && onFileRenameSave()}
                    className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                      onClick={() => onFileRenameClick(file.id, file.name)}
                      className="text-slate-500 hover:text-indigo-600 p-1 flex-shrink-0 transition-colors"
                      title="이름 변경"
                    >
                      <Pencil size={14} className="opacity-70" />
                    </button>
                    <span className="text-xs truncate text-slate-700 font-light">{file.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={file.isSelected}
                  onChange={() => onFileToggle(file.id)}
                  className="cursor-pointer w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 bg-white"
                />
                <button
                  onClick={() => onFileDeleteClick(file.id)}
                  className="text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <X size={14} className="opacity-70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
