/**
 * App Preloader Hook
 * Manages initial data loading and caching for faster app startup
 */

import { useState, useEffect, useCallback } from 'react';
import { localCache } from '../lib/localCache';

export function useAppPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [essentialData, setEssentialData] = useState({
    categories: [],
    platforms: [],
    filters: { genres: [], languages: [], tags: [], regions: [], operatingSystems: [], productTypes: [] },
    settings: { siteName: 'Gamava', currency: 'EUR', theme: 'dark', productsPerPage: 20 },
    cached: false
  });
  const [error, setError] = useState(null);

  const loadEssentialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await localCache.preloadEssentialData();
      setEssentialData(data);
      
      // Log cache performance for debugging (but skip during tests)
      if (process.env.NODE_ENV === 'development' && process.env.NODE_ENV !== 'test') {
        const stats = localCache.getCacheStats();
        console.log('📦 Cache Performance:', {
          cached: data.cached,
          stats,
          categoriesCount: data.categories?.length || 0,
          platformsCount: data.platforms?.length || 0
        });
      }
      
    } catch (err) {
      console.error('Error loading essential data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCache = useCallback(async () => {
    localCache.clearCache();
    await loadEssentialData();
  }, [loadEssentialData]);

  const getCategories = useCallback(() => {
    return essentialData.categories || [];
  }, [essentialData.categories]);

  const getPlatforms = useCallback(() => {
    return essentialData.platforms || [];
  }, [essentialData.platforms]);

  const getFilterOptions = useCallback(() => {
    return essentialData.filters || { 
      genres: [], 
      languages: [], 
      tags: [], 
      regions: [], 
      operatingSystems: [], 
      productTypes: [] 
    };
  }, [essentialData.filters]);

  const getSiteSettings = useCallback(() => {
    return essentialData.settings || { 
      siteName: 'Gamava', 
      currency: 'EUR', 
      theme: 'dark', 
      productsPerPage: 20 
    };
  }, [essentialData.settings]);

  // Initialize on mount
  useEffect(() => {
    loadEssentialData();
  }, [loadEssentialData]);

  return {
    isLoading,
    error,
    essentialData,
    refreshCache,
    getCategories,
    getPlatforms,
    getFilterOptions,
    getSiteSettings,
    cacheStats: localCache.getCacheStats(),
    isCached: essentialData.cached
  };
}

// Export helper hook for components that just need categories
export function useCategories() {
  const { getCategories, isLoading, essentialData } = useAppPreloader();
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data || []);
    };
    loadCategories();
  }, [getCategories]);
  
  return {
    categories,
    isLoading
  };
}

// Export helper hook for components that just need platforms
export function usePlatforms() {
  const { getPlatforms, isLoading } = useAppPreloader();
  return {
    platforms: getPlatforms(),
    isLoading
  };
}