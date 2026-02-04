
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-xl 
    transition-all duration-300 transform 
    hover:scale-[1.02] active:scale-[0.98] 
    disabled:opacity-50 disabled:pointer-events-none disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 
      text-white shadow-lg shadow-indigo-500/30 
      hover:shadow-indigo-500/50 hover:scale-[1.03]
      focus:ring-indigo-500
      relative overflow-hidden group
    `,
    secondary: `
      bg-gradient-to-r from-teal-500 to-cyan-500 
      text-white shadow-lg shadow-teal-500/30 
      hover:shadow-teal-500/50 hover:scale-[1.03]
      focus:ring-teal-500
      relative overflow-hidden group
    `,
    accent: `
      bg-gradient-to-r from-emerald-500 to-green-500 
      text-white shadow-lg shadow-emerald-500/30 
      hover:shadow-emerald-500/50
      focus:ring-emerald-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-500 
      text-white shadow-lg shadow-red-500/30 
      hover:shadow-red-500/50
      focus:ring-red-500
    `,
    outline: `
      border-2 border-white/20 text-white 
      hover:bg-white/10 hover:border-white/40
      focus:ring-white/50
      backdrop-blur-sm
    `,
    ghost: `
      text-slate-300 
      hover:bg-white/10 hover:text-white
      focus:ring-white/30
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Shimmer Effect */}
      {(variant === 'primary' || variant === 'secondary' || variant === 'accent' || variant === 'danger') && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
      )}
      
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
