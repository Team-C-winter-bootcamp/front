import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({
  className = '',
  children,
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ${className}`}
      {...props}
    >
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
