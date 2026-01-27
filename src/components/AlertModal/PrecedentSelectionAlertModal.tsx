interface PrecedentSelectionAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrecedentSelectionAlertModal = ({ isOpen, onClose }: PrecedentSelectionAlertModalProps) => {
  if (!isOpen) return null;

  return ( 
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-80 overflow-hidden shadow-2xl transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">알림</h2>
        </div>
        <div className="p-10 text-center">
          <p className="text-slate-600 font-medium leading-relaxed">
            판례를 하나 이상{'\n'}선택해 주세요.
          </p>
        </div>
        <div className="p-4 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-200"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrecedentSelectionAlertModal;