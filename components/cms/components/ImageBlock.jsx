/**
 * ImageBlock Component - Image display with captions
 */
import { useState } from 'react';
import Image from 'next/image';

const ImageBlock = ({ data }) => {
  const {
    imageUrl = '/placeholder-image.svg',
    altText = 'Image',
    caption = '',
    width = 'w-full',
    alignment = 'center',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const [imageError, setImageError] = useState(false);

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const containerStyle = {
    marginTop,
    marginBottom
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!imageUrl && !imageError) {
    return (
      <div 
        className={`${width} ${alignmentClasses[alignment]} ${customClasses}`}
        style={containerStyle}
      >
        <div className="bg-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-sm">No image selected</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${width} ${alignmentClasses[alignment]} ${customClasses}`}
      style={containerStyle}
    >
      <div className="relative">
        <img
          src={imageError ? '/placeholder-image.svg' : imageUrl}
          alt={altText}
          onError={handleImageError}
          className="w-full h-auto rounded-lg shadow-sm"
          loading="lazy"
        />
        {caption && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;