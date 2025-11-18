import { useState, useEffect } from 'react';
import { wishlistManager } from '../lib/wishlistManager';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load wishlist data
  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlistData = await wishlistManager.getWishlist();
      setWishlist(wishlistData);
      setWishlistCount(wishlistData.length);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Load initial wishlist data
    loadWishlist();

    // Set up listener for wishlist changes
    const unsubscribe = wishlistManager.onWishlistChange(() => {
      loadWishlist();
    });

    // Listen for storage events for cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === 'gamava_session_id') {
        loadWishlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add product to wishlist
  const addToWishlist = async (product) => {
    const result = await wishlistManager.addToWishlist(product);
    if (result.success) {
      // Immediate state update
      const wishlistItem = {
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price || product.final_price,
        platform: product.platform,
        genres: product.genres,
        images_cover_url: product.images_cover_url,
        images_cover_thumbnail: product.images_cover_thumbnail
      };
      setWishlist(prevWishlist => {
        const newWishlist = [wishlistItem, ...prevWishlist];
        setWishlistCount(newWishlist.length);
        return newWishlist;
      });
    }
    return result;
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    const result = await wishlistManager.removeFromWishlist(productId);
    if (result.success) {
      // Immediate state update
      setWishlist(prevWishlist => {
        const newWishlist = prevWishlist.filter(item => String(item.id) !== String(productId));
        setWishlistCount(newWishlist.length);
        return newWishlist;
      });
    }
    return result;
  };

  // Toggle product in wishlist - API first approach
  const toggleWishlist = async (product) => {
    const productIdStr = String(product.id);
    const currentlyInWishlist = wishlist.some(item => String(item.id) === productIdStr);
    
    try {
      let result;
      
      if (currentlyInWishlist) {
        // Remove from wishlist
        result = await wishlistManager.removeFromWishlist(product.id);
        if (result.success) {
          // Update state after successful API call
          setWishlist(prevWishlist => {
            const newWishlist = prevWishlist.filter(item => String(item.id) !== productIdStr);
            setWishlistCount(newWishlist.length);
            return newWishlist;
          });
        }
      } else {
        // Add to wishlist
        result = await wishlistManager.addToWishlist(product);
        if (result.success) {
          // Update state after successful API call
          const wishlistItem = {
            id: product.id,
            product_id: product.id,
            name: product.name,
            price: product.price || product.final_price,
            platform: product.platform,
            genres: product.genres,
            images_cover_url: product.images_cover_url,
            images_cover_thumbnail: product.images_cover_thumbnail
          };
          setWishlist(prevWishlist => {
            const newWishlist = [wishlistItem, ...prevWishlist];
            setWishlistCount(newWishlist.length);
            return newWishlist;
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    // Convert both to strings for reliable comparison
    const productIdStr = String(productId);
    return wishlist.some(item => String(item.id) === productIdStr);
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    const result = await wishlistManager.clearWishlist();
    return result;
  };

  // Move product from wishlist to cart
  const moveToCart = async (productId, addToCartFunction) => {
    const product = wishlist.find(item => item.id === productId);
    if (product && addToCartFunction) {
      const cartResult = addToCartFunction(product);
      if (cartResult) {
        const wishlistResult = await removeFromWishlist(productId);
        return wishlistResult;
      }
    }
    return { success: false, error: 'Failed to move to cart' };
  };

  // Add all wishlist items to cart
  const addAllWishlistToCart = async (addToCartFunction) => {
    if (!addToCartFunction) return { success: false, error: 'No cart function provided' };
    
    const results = [];
    for (const product of wishlist) {
      const cartResult = addToCartFunction(product);
      if (cartResult) {
        results.push(product.id);
      }
    }
    
    return { success: true, addedCount: results.length };
  };

  return {
    // State
    wishlist,
    wishlistCount,
    loading,
    
    // Methods
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart,
    addAllWishlistToCart,
    
    // Utility
    loadWishlist
  };
}