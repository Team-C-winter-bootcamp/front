interface MomoAlertModalProps {
    isOpen: boolean;        // 창이 열렸는지 여부
    onClose: () => void;    // 취소 눌렀을 때 (닫기)
    onConfirm: () => void;  // 확인 눌렀을 때 (로그인 페이지로 이동)
  }
  
  const MomoAlertModal = ({ isOpen, onConfirm }: MomoAlertModalProps) => {
    if (!isOpen) return null; // 닫혀있으면 아무것도 안 그림
  
    return (
      // 회색색 배경 (화면 전체 덮기)
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        
        {/* 알림창 박스 */}
        <div className="bg-white rounded-lg shadow-lg w-80 overflow-hidden">
          
          {/* 상단 제목 */}
          <div className="p-4 border-b text-center">
            <h2 className="text-lg font-bold text-black">알림</h2>
          </div>
  
          {/* 내용 */}
          <div className="p-8 text-center">
            <p className="text-gray-800 font-medium whitespace-pre-line">
              이 메모를 삭제하시겠습니까?
            </p>
          </div>
  
          {/* 확인 버튼  */}
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-blue-200 hover:bg-blue-300 text-black font-bold transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  };
  
  export default MomoAlertModal;