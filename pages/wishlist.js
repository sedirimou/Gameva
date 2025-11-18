import { useState, useEffect } from 'react';
import Link from 'next/link';
import EcommerceLayout from '../components/layout/EcommerceLayout';
import SweeperGrid from '../components/frontend/SweeperGrid';
import { useCartWishlist } from '../hooks/useCartWishlist';
import { useWishlist } from '../hooks/useWishlist';

export default function WishlistPage() {
  // Use database-connected hooks
  const { addToCart } = useCartWishlist();
  const { wishlist, loading, clearWishlist, addAllWishlistToCart } = useWishlist();

  const handleAddToCart = async (product) => {
    const success = addToCart(product);
    if (success) {
      console.log('Product added to cart from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    const result = await clearWishlist();
    if (result.success) {
      console.log('Wishlist cleared successfully');
    }
  };

  const handleAddAllToCart = async () => {
    const result = await addAllWishlistToCart(addToCart);
    if (result.success) {
      console.log(`Added ${result.addedCount} products to cart`);
    }
  };

  return (
    <EcommerceLayout 
      title="Wishlist" 
      description="Your gaming wishlist on Gamava"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">My Wishlist</h1>
        <p className="text-white/80">
          {wishlist.length} {wishlist.length === 1 ? 'game' : 'games'} saved for later
        </p>
      </div>

      {/* Wishlist Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-white/80 mb-8">
            Browse our games and add your favorites to your wishlist
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Browse Games
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-white/80">
              Showing {wishlist.length} of {wishlist.length} games
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddAllToCart}
                className="px-4 py-2 bg-[#153e8f] text-white rounded-lg hover:bg-[#1e4ba3] transition-colors text-sm"
              >
                Add All to Cart
              </button>
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Clear Wishlist
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <SweeperGrid products={wishlist} />
        </div>
      )}
    </EcommerceLayout>
  );
}