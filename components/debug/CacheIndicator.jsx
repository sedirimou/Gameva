/**
 * Cache Performance Indicator (Development Only)
 * Shows cache status and performance metrics for debugging
 */

import { useState } from 'react';
import { useAppPreloader } from '../../hooks/useAppPreloader';

export default function CacheIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const { cacheStats, isCached } = useAppPreloader();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 px-3 py-1 rounded text-xs font-mono transition-colors ${
          isCached 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
        title="Cache Performance"
      >
        {isCached ? '📦 CACHED' : '🔄 LOADING'}
      </button>

      {/* Cache Stats Panel */}
      {isVisible && (
        <div className="bg-black/90 text-white p-4 rounded-lg shadow-lg font-mono text-xs max-w-xs">
          <div className="mb-2 font-bold">Cache Performance</div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={isCached ? 'text-green-400' : 'text-orange-400'}>
                {isCached ? 'CACHED' : 'FETCHING'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{cacheStats?.cacheSize || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Valid:</span>
              <span className={cacheStats?.isValid ? 'text-green-400' : 'text-red-400'}>
                {cacheStats?.isValid ? 'YES' : 'NO'}
              </span>
            </div>
            
            {cacheStats?.lastUpdate && (
              <div className="flex justify-between">
                <span>Updated:</span>
                <span className="text-blue-400">
                  {new Date(cacheStats.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {cacheStats?.expiration && (
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="text-yellow-400">
                  {new Date(cacheStats.expiration).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600 text-center">
            <button
              onClick={() => {
                // Clear localStorage cache
                Object.keys(localStorage).forEach(key => {
                  if (key.startsWith('gamava_cache_')) {
                    localStorage.removeItem(key);
                  }
                });
                window.location.reload();
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
}