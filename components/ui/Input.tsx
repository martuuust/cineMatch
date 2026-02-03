
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300 flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full ${icon ? 'pl-12' : 'px-5'} py-3.5 rounded-xl 
            bg-white/5 border border-white/10 
            text-white placeholder:text-slate-500
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none 
            transition-all duration-300
            hover:border-white/20
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} 
            ${className}
          `}
          {...props}
        />

        {/* Focus glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-xl ring-1 ring-indigo-500/30" />
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-400 ml-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
