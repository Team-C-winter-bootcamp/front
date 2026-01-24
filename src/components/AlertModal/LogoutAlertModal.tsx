interface LogoutAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutAlertModal = ({ isOpen, onClose, onConfirm }: LogoutAlertModalProps) => {
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
            로그아웃을 하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3 p-4 border-t border-minimal-gray bg-[#F5F3EB]">
          <button
            onClick={onClose}
            className="btn-minimal flex-1 font-light"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="btn-minimal-primary flex-1 font-light"
          >
            확인
          </button>

        </div>
      </div>
    </div>
  );
};

export default LogoutAlertModal;