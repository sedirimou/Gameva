import React from 'react';

export default function SpacerBlock({ height = 'medium' }) {
  const heightClasses = {
    small: 'h-5',    // 20px
    medium: 'h-10',  // 40px
    large: 'h-15',   // 60px
    xlarge: 'h-20'   // 80px
  }[height] || 'h-10';

  return (
    <div className={`${heightClasses} w-full`} />
  );
}