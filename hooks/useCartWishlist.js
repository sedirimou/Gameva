import { useState, useEffect } from 'react';
import { cartWishlistManager } from '../lib/cartWishlistManager';

export function useCartWishlist() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Initial load
    const initialCart = cartWishlistManager.getCart();
    const initialWishlist = cartWishlistManager.getWishlist();
    
    setCart(initialCart);
    setWishlist(initialWishlist);
    setCartCount(cartWishlistManager.getCartCount());
    setWishlistCount(cartWishlistManager.getWishlistCount());

    // Set up listeners
    const unsubscribeCart = cartWishlistManager.onCartChange((newCart) => {
      setCart(newCart);
      setCartCount(cartWishlistManager.getCartCount());
    });

    const unsubscribeWishlist = cartWishlistManager.onWishlistChange((newWishlist) => {
      setWishlist(newWishlist);
      setWishlistCount(cartWishlistManager.getWishlistCount());
    });

    // Listen to storage events for cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        const newCart = cartWishlistManager.getCart();
        setCart(newCart);
        setCartCount(cartWishlistManager.getCartCount());
      } else if (e.key === 'wishlist') {
        const newWishlist = cartWishlistManager.getWishlist();
        setWishlist(newWishlist);
        setWishlistCount(cartWishlistManager.getWishlistCount());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      unsubscribeCart();
      unsubscribeWishlist();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cart methods
  const addToCart = (product, quantity = 1) => {
    return cartWishlistManager.addToCart(product, quantity);
  };

  const removeFromCart = (productId) => {
    return cartWishlistManager.removeFromCart(productId);
  };

  const updateCartQuantity = (productId, quantity) => {
    return cartWishlistManager.updateCartQuantity(productId, quantity);
  };

  const isInCart = (productId) => {
    if (typeof window === 'undefined') return false;
    return cartWishlistManager.isInCart(productId);
  };

  const clearCart = () => {
    return cartWishlistManager.clearCart();
  };

  // Wishlist methods
  const addToWishlist = (product) => {
    return cartWishlistManager.addToWishlist(product);
  };

  const removeFromWishlist = (productId) => {
    return cartWishlistManager.removeFromWishlist(productId);
  };

  const toggleWishlist = (product) => {
    return cartWishlistManager.toggleWishlist(product);
  };

  const isInWishlist = (productId) => {
    if (typeof window === 'undefined') return false;
    return cartWishlistManager.isInWishlist(productId);
  };

  const clearWishlist = () => {
    return cartWishlistManager.clearWishlist();
  };

  // Utility methods
  const moveToCart = (productId) => {
    return cartWishlistManager.moveToCart(productId);
  };

  const addAllWishlistToCart = () => {
    return cartWishlistManager.addAllWishlistToCart();
  };

  return {
    // State
    cart,
    wishlist,
    cartCount,
    wishlistCount,
    
    // Cart methods
    addToCart,
    removeFromCart,
    updateCartQuantity,
    isInCart,
    clearCart,
    
    // Wishlist methods
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    
    // Utility methods
    moveToCart,
    addAllWishlistToCart
  };
}