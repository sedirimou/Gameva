import { sessionManager } from './sessionManager';
import { handleApiError, handleApiSuccess, errorMessages } from './errorHandler';

/**
 * Database-connected wishlist manager
 * Handles both logged-in users (user_id) and guests (session_id)
 */
export class WishlistManager {
  constructor() {
    this.listeners = [];
  }

  // Get current wishlist from database
  async getWishlist() {
    try {
      const { user_id, session_id } = sessionManager.getUserIdentification();
      const params = new URLSearchParams();
      
      if (user_id) {
        params.append('user_id', user_id);
      } else if (session_id) {
        params.append('session_id', session_id);
      } else {
        return [];
      }

      const response = await fetch(`/api/wishlist?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Wishlist fetch failed:', response.status, response.statusText);
        return [];
      }
      
      const data = await response.json();
      return data.wishlist || [];
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching wishlist:', error);
      }
      return [];
    }
  }

  // Add product to wishlist
  async addToWishlist(product) {
    try {
      const { user_id, session_id } = sessionManager.getUserIdentification();
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          session_id,
          product_id: product.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        handleApiSuccess(`${product.name || 'Product'} added to your wishlist!`);
        this.notifyListeners();
        return { success: true, action: 'added' };
      } else if (response.status === 409) {
        handleApiError({ response: { status: 409, data: { message: 'Product is already in your wishlist' } } });
        return { success: false, error: 'Product already in wishlist' };
      } else {
        handleApiError({ response: { status: response.status, data } });
        return { success: false, error: data.error };
      }
    } catch (error) {
      handleApiError(error, errorMessages.wishlist.addFailed);
      return { success: false, error: 'Network error' };
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    try {
      const { user_id, session_id } = sessionManager.getUserIdentification();
      
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          session_id,
          product_id: productId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        handleApiSuccess('Product removed from your wishlist!');
        this.notifyListeners();
        return { success: true, action: 'removed' };
      } else {
        handleApiError({ response: { status: response.status, data } });
        return { success: false, error: data.error };
      }
    } catch (error) {
      handleApiError(error, errorMessages.wishlist.removeFailed);
      return { success: false, error: 'Network error' };
    }
  }

  // Toggle product in wishlist (deprecated - handled by React hook)
  async toggleWishlist(product) {
    // This method is deprecated - the toggle logic is now handled in the React hook
    // which calls addToWishlist or removeFromWishlist directly
    const wishlist = await this.getWishlist();
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      return await this.removeFromWishlist(product.id);
    } else {
      return await this.addToWishlist(product);
    }
  }

  // Check if product is in wishlist
  async isInWishlist(productId) {
    const wishlist = await this.getWishlist();
    return wishlist.some(item => item.id === productId);
  }

  // Get wishlist count
  async getWishlistCount() {
    const wishlist = await this.getWishlist();
    return wishlist.length;
  }

  // Clear entire wishlist
  async clearWishlist() {
    try {
      const identification = sessionManager.getUserIdentification();
      
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...identification,
          clear_all: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.notifyListeners();
        return { success: true, deletedCount: data.deletedCount };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, error: 'Failed to clear wishlist' };
    }
  }

  // Subscribe to wishlist changes
  onWishlistChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback();
    });
  }
}

export const wishlistManager = new WishlistManager();