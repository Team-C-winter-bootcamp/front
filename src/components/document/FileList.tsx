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
    <div className="h-full flex flex-col p-4 pt-0 overflow-hidden">
      <div className="mb-2 flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-gray-700">소스</h2>
        <span className="text-xs text-gray-500">{files.length}개</span>
      </div>

      <div className="space-y-2 mb-2 flex-shrink-0">
        <button
          onClick={onFileAdd}
          className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
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
          className={`flex-shrink-0 border-2 border-dashed rounded-lg transition-colors p-2 flex items-center justify-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50'
          }`}
          style={{ height: '200px' }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-center text-gray-400 text-xs">
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
              className={`flex items-center justify-between p-2 rounded border bg-white group ${
                file.isSelected ? 'border-blue-300 shadow-sm' : 'border-gray-200'
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
                    className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 outline-none text-xs"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                      onClick={() => onFileRenameClick(file.id, file.name)}
                      className="text-gray-400 hover:text-blue-500 p-1 flex-shrink-0"
                      title="이름 변경"
                    >
                      <div className="inline-block p-1 rounded-full ">
                        <img 
                          src={pencil} 
                          alt="pencil" 
                          className="w-4 h-4 object-contain justify-center items-center pt-1 opacity-60" 
                        />
                      </div>
                    </button>
                    <span className="text-xs truncate">{file.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ">
                <input
                  type="checkbox"
                  checked={file.isSelected}
                  onChange={() => onFileToggle(file.id)}
                  className="cursor-pointer pt-5"
                />
                <button
                  onClick={() => onFileDeleteClick(file.id)}
                  className="text-gray-400 hover:text-red-500 pd-1"
                >
                  <img src={x} alt="x" className="w-2 h-2 object-contain justify-center items-center pd-1 opacity-60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
