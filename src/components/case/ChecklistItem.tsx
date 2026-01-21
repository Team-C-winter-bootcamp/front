import React from 'react';
import { Check, X } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  isComplete: boolean;
}

export function ChecklistItem({ label, isComplete }: ChecklistItemProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div
        className={`
        flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
        ${isComplete ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}
      `}
      >
        {isComplete ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className={isComplete ? 'text-slate-700' : 'text-slate-500'}>
        {label}
      </span>
    </div>
  );
}
