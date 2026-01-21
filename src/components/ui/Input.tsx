import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  className = '',
  label,
  error,
  helperText,
  leftIcon,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            block w-full rounded-xl border-slate-200 shadow-sm 
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5
            disabled:bg-slate-50 disabled:text-slate-500
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
