interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">
          {currentStep}단계 / {totalSteps}단계
        </span>
        {label && <span className="text-sm text-slate-500">{label}</span>}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`
          }}
        ></div>
      </div>
    </div>
  );
}
