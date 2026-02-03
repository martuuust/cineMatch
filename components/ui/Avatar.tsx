
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isHost?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', isHost = false }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  const bgColors = [
    'bg-gradient-to-br from-violet-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-amber-500 to-orange-600'
  ];
  
  // Deterministic color based on name
  const colorIndex = name.charCodeAt(0) % bgColors.length;

  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-full text-white font-bold ${bgColors[colorIndex]} ${sizeClasses[size]} shadow-md ring-2 ring-white`}>
        {initials}
      </div>
      {isHost && (
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-1 border-2 border-background shadow-sm">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Avatar;
