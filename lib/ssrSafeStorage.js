/**
 * SSR-Safe Storage Utilities for Production Deployment
 * Ensures compatibility with Vercel and other SSR environments
 */

export const SSRSafeStorage = {
  /**
   * Safely get item from localStorage with SSR protection
   */
  getItem: (key, defaultValue = null) => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // For specific keys like currency, try plain string first, then JSON
      if (key === 'preferred_currency' || key === 'selected_currency') {
        // If it's a simple string like "EUR", return as-is
        if (item && !item.startsWith('{') && !item.startsWith('[')) {
          return item;
        }
      }
      
      // Try to parse as JSON for complex objects
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      // For currency keys, try returning the raw string if JSON parse fails
      if (key === 'preferred_currency' || key === 'selected_currency') {
        const rawItem = localStorage.getItem(key);
        return rawItem || defaultValue;
      }
      return defaultValue;
    }
  },

  /**
   * Safely set item in localStorage with SSR protection
   */
  setItem: (key, value) => {
    if (typeof window === 'undefined') {
      console.warn(`Cannot set ${key}: localStorage not available (SSR)`);
      return false;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },

  /**
   * Safely remove item from localStorage with SSR protection
   */
  removeItem: (key) => {
    if (typeof window === 'undefined') {
      console.warn(`Cannot remove ${key}: localStorage not available (SSR)`);
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  /**
   * Safely dispatch window events with SSR protection
   */
  dispatchEvent: (eventName) => {
    if (typeof window === 'undefined') {
      console.warn(`Cannot dispatch ${eventName}: window not available (SSR)`);
      return false;
    }
    
    try {
      window.dispatchEvent(new Event(eventName));
      return true;
    } catch (error) {
      console.error(`Error dispatching ${eventName} event:`, error);
      return false;
    }
  },

  /**
   * Check if we're running in a browser environment
   */
  isBrowser: () => typeof window !== 'undefined',

  /**
   * Get browser environment info for debugging
   */
  getEnvironmentInfo: () => {
    if (typeof window === 'undefined') {
      return { environment: 'SSR', hasLocalStorage: false, hasWindow: false };
    }
    
    return {
      environment: 'Browser',
      hasLocalStorage: typeof Storage !== 'undefined',
      hasWindow: true,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }
};