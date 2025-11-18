import React from 'react';
import Link from 'next/link';

export default function HeroSection({ 
  title = 'Welcome to Our Store', 
  subtitle = 'Discover amazing products and services',
  buttonText = 'Shop Now',
  buttonLink = '/category/all-products',
  backgroundImage = null
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <img 
            src={backgroundImage} 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#99b476] via-[#29adb2] to-[#153e8f]" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {buttonText && buttonLink && (
          <Link 
            href={buttonLink}
            className="inline-block bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}