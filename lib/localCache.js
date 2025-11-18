/**
 * Local Cache Manager for Browser Storage
 * Stores essential data locally to speed up initial page loads
 */

export class LocalCacheManager {
  constructor() {
    this.cacheKeys = {
      categories: 'gamava_categories',
      platforms: 'gamava_platforms',
      filters: 'gamava_filters',
      settings: 'gamava_settings',
      lastUpdate: 'gamava_cache_timestamp'
    };
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Check if cache is valid and not expired
   */
  isCacheValid(key) {
    try {
      const lastUpdate = localStorage.getItem(this.cacheKeys.lastUpdate);
      if (!lastUpdate) return false;
      
      const timestamp = parseInt(lastUpdate);
      const now = Date.now();
      const isExpired = (now - timestamp) > this.cacheExpiration;
      
      return !isExpired && localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn('Cache validation error:', error);
      return false;
    }
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  getCachedData(cacheKey) {
    try {
      if (!this.isCacheValid(this.cacheKeys[cacheKey])) {
        return null;
      }
      
      const data = localStorage.getItem(this.cacheKeys[cacheKey]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Error retrieving cached ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(cacheKey, data) {
    try {
      localStorage.setItem(this.cacheKeys[cacheKey], JSON.stringify(data));
      localStorage.setItem(this.cacheKeys.lastUpdate, Date.now().toString());
    } catch (error) {
      console.warn(`Error caching ${cacheKey}:`, error);
    }
  }

  /**
   * Get categories from cache or fetch from API
   */
  async getCategories() {
    const cached = this.getCachedData('categories');
    if (cached && cached.length > 0) {
      return cached;
    }

    try {
      const response = await fetch('/api/categories/main-menu');
      const data = await response.json();
      
      // Skip logging during tests
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Skip logging during tests
    } else {
      console.log('📂 Categories API Response:', data)
    };
      
      if (response.ok && data && data.categories && Array.isArray(data.categories)) {
        this.setCachedData('categories', data.categories);
        return data.categories;
      } else {
        console.warn('Invalid categories response:', data);
      }
    } catch (error) {
      console.warn('Error fetching categories:', error);
    }
    
    return [];
  }



  /**
   * Get platforms from cache or fetch from API
   */
  async getPlatforms() {
    const cached = this.getCachedData('platforms');
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/admin/attributes/platforms');
      const data = await response.json();
      
      if (response.ok && data) {
        this.setCachedData('platforms', data);
        return data;
      }
    } catch (error) {
      console.warn('Error fetching platforms:', error);
    }
    
    return [];
  }

  /**
   * Get filter options from cache or fetch from API
   */
  async getFilterOptions() {
    const cached = this.getCachedData('filters');
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('/api/admin/filter-options');
      const data = await response.json();
      
      if (response.ok && data) {
        this.setCachedData('filters', data);
        return data;
      }
    } catch (error) {
      console.warn('Error fetching filter options:', error);
    }
    
    return {
      genres: [],
      languages: [],
      tags: [],
      regions: [],
      operatingSystems: [],
      productTypes: []
    };
  }

  /**
   * Get site settings from cache or use defaults
   */
  async getSiteSettings() {
    const cached = this.getCachedData('settings');
    if (cached) {
      return cached;
    }

    // Default settings - these could be fetched from an API endpoint if needed
    const defaultSettings = {
      siteName: 'Gamava',
      currency: 'EUR',
      theme: 'dark',
      productsPerPage: 20,
      enableWishlist: true,
      enableCart: true
    };

    this.setCachedData('settings', defaultSettings);
    return defaultSettings;
  }

  /**
   * Preload all essential data for faster navigation
   */
  async preloadEssentialData() {
    const promises = [
      this.getCategories(),
      this.getPlatforms(),
      this.getFilterOptions(),
      this.getSiteSettings()
    ];

    try {
      const [categories, platforms, filters, settings] = await Promise.all(promises);
      
      return {
        categories,
        platforms,
        filters,
        settings,
        cached: true
      };
    } catch (error) {
      console.warn('Error preloading essential data:', error);
      return {
        categories: [],
        platforms: [],
        filters: { genres: [], languages: [], tags: [], regions: [], operatingSystems: [], productTypes: [] },
        settings: { siteName: 'Gamava', currency: 'EUR', theme: 'dark', productsPerPage: 20 },
        cached: false
      };
    }
  }

  /**
   * Clear all cached data (useful for manual refresh)
   */
  clearCache() {
    try {
      Object.values(this.cacheKeys).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    try {
      const lastUpdate = localStorage.getItem(this.cacheKeys.lastUpdate);
      const cacheSize = Object.values(this.cacheKeys).reduce((total, key) => {
        const item = localStorage.getItem(key);
        return total + (item ? item.length : 0);
      }, 0);

      return {
        lastUpdate: lastUpdate ? new Date(parseInt(lastUpdate)) : null,
        cacheSize: `${(cacheSize / 1024).toFixed(2)} KB`,
        isValid: this.isCacheValid(this.cacheKeys.categories),
        expiration: new Date(Date.now() + this.cacheExpiration)
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Export singleton instance
export const localCache = new LocalCacheManager();

// Export cache debugging utilities for development
export const cacheDebug = {
  stats: () => localCache.getCacheStats(),
  clear: () => localCache.clearCache(),
  refresh: () => {
    localCache.clearCache();
    return localCache.preloadEssentialData();
  }
};