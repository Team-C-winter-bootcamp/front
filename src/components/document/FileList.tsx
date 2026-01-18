import { FileItem } from '../../hooks/useChatSessions'
import pencil from '../../assets/pencil.png'
import x from '../../assets/x.png'

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
    <div className="h-full flex flex-col p-5 pt-0 overflow-hidden bg-[#111e31] font-sans text-slate-300">
      <div className="mb-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-light text-white text-sm tracking-wide">소스</h2>
        <span className="text-xs text-slate-400 font-light">{files.length}개</span>
      </div>

      <div className="space-y-2 mb-3 flex-shrink-0">
        <button
          onClick={onFileAdd}
          className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition-all shadow-md text-sm font-medium"
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
          className={`flex-shrink-0 border border-dashed rounded-minimal-lg transition-all duration-200 p-2 flex items-center justify-center ${
            isDragging 
              ? 'border-blue-500 bg-[#1E293B]' 
              : 'border-[#334155] bg-[#1E293B]'
          }`}
          style={{ height: '200px' }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-center text-slate-400 text-xs font-light">
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
              className={`flex items-center justify-between p-3 rounded-lg group transition-all duration-200 bg-[#1E293B] border ${
                file.isSelected 
                  ? 'border-blue-500 shadow-sm ring-1 ring-[#334155]' 
                  : 'border-[#334155] hover:bg-[#1E293B]/80'
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
                    className="w-full bg-[#0F172A] border border-blue-500 rounded px-2 py-1 text-white text-xs outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                      onClick={() => onFileRenameClick(file.id, file.name)}
                      className="text-slate-400 hover:text-white p-1 flex-shrink-0 transition-colors"
                      title="이름 변경"
                    >
                      <div className="inline-block p-1 rounded-full">
                        <img 
                          src={pencil} 
                          alt="pencil" 
                          className="w-4 h-4 object-contain justify-center items-center pt-1 opacity-50" 
                        />
                      </div>
                    </button>
                    <span className="text-xs truncate text-slate-300 font-light">{file.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={file.isSelected}
                  onChange={() => onFileToggle(file.id)}
                  className="cursor-pointer w-4 h-4 text-blue-400 border-[#334155] rounded focus:ring-blue-400 bg-[#0F172A]"
                />
                <button
                  onClick={() => onFileDeleteClick(file.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <img src={x} alt="x" className="w-3 h-3 object-contain justify-center items-center opacity-50" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
