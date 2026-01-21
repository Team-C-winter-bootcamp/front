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
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#4A90E2]"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#E8F0F7] flex items-center justify-center text-[#4A90E2]">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}
