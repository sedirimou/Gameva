import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import MainLayout from '../components/layout/MainLayout';

export default function Custom404() {
  return (
    <MainLayout>
      <Head>
        <title>Page Not Found - Gamava</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      
      <div 
        className="min-h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#153e8f' }}
      >
        {/* Scattered Gamepad FontAwesome Icons - Hidden on mobile to prevent overlap */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {/* Gamepad 1 - Top Left */}
          <div className="absolute top-16 left-20 opacity-10 transform rotate-12">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-3xl sm:text-4xl md:text-5xl" />
          </div>

          {/* Gamepad 2 - Top Right */}
          <div className="absolute top-32 right-24 opacity-15 transform -rotate-6">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-4xl sm:text-5xl md:text-6xl" />
          </div>

          {/* Gamepad 3 - Middle Left */}
          <div className="absolute top-1/2 left-12 opacity-12 transform rotate-45">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-2xl sm:text-3xl md:text-4xl" />
          </div>

          {/* Gamepad 4 - Middle Right */}
          <div className="absolute top-1/3 right-16 opacity-8 transform -rotate-30">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-3xl sm:text-4xl md:text-5xl" />
          </div>

          {/* Gamepad 5 - Bottom Left */}
          <div className="absolute bottom-24 left-32 opacity-14 transform rotate-75">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-2xl sm:text-3xl" />
          </div>

          {/* Gamepad 6 - Bottom Right */}
          <div className="absolute bottom-16 right-28 opacity-11 transform -rotate-15">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-3xl sm:text-4xl md:text-5xl" />
          </div>
        </div>

        {/* Mobile-only smaller icons positioned safely - Only in extreme corners */}
        <div className="absolute inset-0 pointer-events-none sm:hidden" style={{ zIndex: 1 }}>
          {/* Mobile Gamepad 1 - Top Left Corner */}
          <div className="absolute top-4 left-4 opacity-5 transform rotate-12">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-lg" />
          </div>

          {/* Mobile Gamepad 2 - Top Right Corner */}
          <div className="absolute top-4 right-4 opacity-5 transform -rotate-12">
            <FontAwesomeIcon icon={faGamepad} className="text-white text-lg" />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center relative z-50 px-6 max-w-md mx-4">
          {/* 404 Text */}
          <div className="mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>404</h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Page Not Found</h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Back to Home Button */}
          <Link 
            href="/"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/20 relative z-50"
            style={{
              background: 'linear-gradient(135deg, rgba(41, 173, 178, 0.3) 0%, rgba(153, 180, 118, 0.3) 100%)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Back to Home Page
          </Link>

        </div>
      </div>
    </MainLayout>
  );
}