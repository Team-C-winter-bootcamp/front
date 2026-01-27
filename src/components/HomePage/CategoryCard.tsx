import React from 'react';
import { Card } from '../ui/Card';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function CategoryCard({
  title,
  description,
  icon,
  onClick
}: CategoryCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 hover:border-indigo-600"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}
