interface SignupAlertModalProps {
  isOpen: boolean;        // 창이 열렸는지 여부
  onClose: () => void;    // 배경 눌렀을 때 (닫기)
  onConfirm: () => void;  // 확인 눌렀을 때 (로그인 페이지로 이동)
}

const SignupAlertModal = ({ isOpen, onClose, onConfirm }: SignupAlertModalProps) => {
  if (!isOpen) return null; // 닫혀있으면 아무것도 안 그림

  return (
    // 배경 (배경 클릭 시 닫히도록 onClose 연결 - 선택사항)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} 
    >
      
      {/* 알림창 박스 (박스 클릭 시 닫히지 않게 이벤트 전파 방지) */}
      <div 
        className="bg-white rounded-lg shadow-lg w-80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 상단 제목 */}
        <div className="p-4 border-b text-center">
          <h2 className="text-lg font-bold text-black">알림</h2>
        </div>

        {/* 내용  */}
        <div className="p-8 text-center">
          <p className="text-gray-800 font-medium whitespace-pre-line">
            회원가입이 완료되었습니다.{'\n'}
            확인 버튼을 누르면{'\n'}로그인 페이지로 이동합니다.
          </p>
        </div>

        {/* 확인 버튼 */}
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

export default SignupAlertModal;