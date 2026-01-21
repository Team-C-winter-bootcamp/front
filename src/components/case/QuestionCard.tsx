import React from 'react';
import { Card } from '../ui/Card';

interface QuestionCardProps {
  question: string;
  helperText?: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export function QuestionCard({
  question,
  helperText,
  children,
  isActive = true
}: QuestionCardProps) {
  return (
    <Card
      className={`transition-all duration-300 ${isActive ? 'ring-2 ring-indigo-100 shadow-md' : 'opacity-70 grayscale'}`}
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{question}</h3>
      {helperText && <p className="text-sm text-slate-500 mb-4">{helperText}</p>}
      <div className={isActive ? '' : 'pointer-events-none'}>{children}</div>
    </Card>
  );
}
