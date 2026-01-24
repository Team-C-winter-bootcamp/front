interface SignupAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SignupAlertModal = ({ isOpen, onClose, onConfirm }: SignupAlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-minimal-charcoal bg-opacity-30 backdrop-blur-sm font-serif"
      onClick={onClose} 
    >
      <div  

        className="card-minimal w-80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-minimal-gray text-center">
          <h2 className="text-lg font-light text-minimal-charcoal">알림</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-minimal-dark-gray font-light whitespace-pre-line">
            회원가입이 완료되었습니다.{'\n'}
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

export default SignupAlertModal;