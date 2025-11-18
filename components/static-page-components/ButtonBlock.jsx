import React from 'react';
import Link from 'next/link';

export default function ButtonBlock({ 
  text = 'Click Me',
  link = '/',
  style = 'primary',
  size = 'medium'
}) {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }[size] || 'px-6 py-3 text-base';

  const styleClasses = {
    primary: 'bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white hover:shadow-xl',
    secondary: 'bg-white/20 text-white border border-white/30 hover:bg-white/30',
    outline: 'border-2 border-white/50 text-white hover:bg-white/10'
  }[style] || 'bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white hover:shadow-xl';

  return (
    <div className="text-center my-6">
      <Link 
        href={link}
        className={`inline-block ${sizeClasses} ${styleClasses} rounded-lg font-semibold transition-all duration-300 transform hover:scale-105`}
      >
        {text}
      </Link>
    </div>
  );
}