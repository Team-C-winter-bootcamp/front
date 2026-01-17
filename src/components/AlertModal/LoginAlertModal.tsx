interface LoginAlertModalProps {
    isOpen: boolean;        // 창이 열렸는지 여부
    onClose: () => void;    // 취소 눌렀을 때 (닫기)
    onConfirm: () => void;  // 확인 눌렀을 때 (로그인 페이지로 이동)
  }
  
  const LoginAlertModal = ({ isOpen, onConfirm }: LoginAlertModalProps) => {
    if (!isOpen) return null; // 닫혀있으면 아무것도 안 그림
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-minimal-charcoal bg-opacity-30 backdrop-blur-sm font-serif">
        <div className="card-minimal w-80 overflow-hidden">
          <div className="p-4 border-b border-minimal-gray text-center">
            <h2 className="text-lg font-light text-minimal-charcoal">알림</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-minimal-dark-gray font-light whitespace-pre-line">
              로그인이 필요합니다.{'\n'}
              확인 버튼을 누르면{'\n'}로그인 페이지로 이동합니다.
            </p>
          </div>
          <button
            onClick={onConfirm}
            className="w-full py-4 btn-minimal-primary font-light"
          >
            확인
          </button>
        </div>
      </div>
    );
  };
  
  export default LoginAlertModal;