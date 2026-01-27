import React from 'react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass?: string;
  isFullWidth?: boolean;
}

export function CategoryCard({
  title,
  description,
  icon,
  onClick,
  colorClass = 'bg-indigo-50 text-indigo-600',
  isFullWidth = false
}: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}
    >
      <Card
        className="h-full cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border-slate-100 hover:border-indigo-400 group overflow-hidden relative"
        onClick={onClick}
      >
        {/* 호버 시 은은한 배경 빛 효과 */}
        <div className="absolute -inset-px bg-gradient-to-br from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-start space-x-5 relative z-10">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${colorClass}`}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{title}</h3>
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed font-medium">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
