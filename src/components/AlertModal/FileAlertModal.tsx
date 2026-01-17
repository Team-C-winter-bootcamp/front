interface FileAlertModalProps {
    isOpen: boolean;        // 창이 열렸는지 여부
    onClose: () => void;    // 취소 눌렀을 때 (닫기)
    onConfirm: () => void;  // 확인 눌렀을 때 (삭제 실행)
  }
  
  const FileAlertModal = ({ isOpen, onClose, onConfirm }: FileAlertModalProps) => {
    if (!isOpen) return null; // 닫혀있으면 아무것도 안 그림
  
    return (
      // 회색 배경 (화면 전체 덮기)
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose} // 배경 클릭 시 닫기 (선택 사항)
      >
        
        {/* 알림창 박스 */}
        <div 
          className="bg-white rounded-lg shadow-lg w-80 overflow-hidden"
          onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫기 방지
        >
          
          {/* 상단 제목 */}
          <div className="p-4 border-b text-center">
            <h2 className="text-lg font-bold text-black">알림</h2>
          </div>
  
          {/* 내용 */}
          <div className="p-8 text-center">
            <p className="text-gray-800 font-medium whitespace-pre-line">
              이 파일를 삭제하시겠습니까?
            </p>
          </div>
  
          {/* 버튼 영역 (흰색 배경, 버튼 2개 배치) */}
          <div className="flex gap-3 p-4 border-t bg-white">
            {/* 취소 버튼 */}
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
  
            {/* 확인 버튼 */}
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default FileAlertModal;