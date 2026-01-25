import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between w-full relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />

        {steps.map((step) => (
          <div
            key={step.id}
            className="flex flex-col items-center bg-slate-50 px-2"
          >
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-colors
              ${step.status === 'completed' ? 'bg-green-50 border-green-500 text-green-600' : step.status === 'current' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-300 text-slate-300'}
            `}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : step.status === 'current' ? (
                <Clock className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${step.status === 'current' ? 'text-indigo-700' : 'text-slate-500'}`}
            >
              {step.label}
            </span>
            {step.date && (
              <span className="text-xs text-slate-400 mt-1">{step.date}</span>
            )}
          </div>
        ))}
      </div>
      <div className="md:hidden flex flex-col space-y-6 relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 -z-10" />

        {steps.map((step) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-slate-50
              ${step.status === 'completed' ? 'bg-green-50 border-green-500 text-green-600' : step.status === 'current' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-300 text-slate-300'}
            `}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : step.status === 'current' ? (
                <Clock className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${step.status === 'current' ? 'text-indigo-700' : 'text-slate-900'}`}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-slate-500 mt-1">{step.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
