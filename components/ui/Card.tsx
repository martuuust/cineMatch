
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'light' | 'glow';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  variant = 'default'
}) => {
  const variants = {
    default: 'glass-card',
    light: 'glass-card-light',
    glow: 'glass-card animate-pulse-glow'
  };

  return (
    <div className={`${variants[variant]} rounded-2xl overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
