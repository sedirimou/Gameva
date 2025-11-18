import React from 'react';

export default function ImageBlock({ 
  src = '/placeholder-game.svg',
  alt = 'Image',
  caption = '',
  width = 'full'
}) {
  const widthClasses = {
    full: 'w-full',
    large: 'w-3/4 mx-auto',
    medium: 'w-1/2 mx-auto',
    small: 'w-1/4 mx-auto'
  }[width] || 'w-full';

  return (
    <div className="my-6">
      <div className={`${widthClasses} rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20`}>
        <img 
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-game.svg';
          }}
        />
        {caption && (
          <div className="p-4 text-center">
            <p className="text-white/80 text-sm italic">
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}