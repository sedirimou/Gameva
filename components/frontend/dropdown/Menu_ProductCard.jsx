import React from 'react';
import Link from 'next/link';
import { useCurrency } from '../../../hooks/useCurrency';
import { getProductImageUrl, getProductImageAlt } from '../../../lib/imageUtils';

/**
 * Reusable Product Card Component for Dropdown Popular Products
 * Implements consistent 3:4 aspect ratio and responsive sizing
 */
export default function Menu_ProductCard({ product, isLoading = false }) {
  const { formatPrice } = useCurrency();
  
  // Truncate title to maximum length
  const truncateTitle = (title, maxLength = 8) => {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden">
        <div className="product-card-image bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Generate product slug from name using same logic as API
  const generateSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const productSlug = generateSlug(product.name) || product.kinguinid || product.id;

  return (
    <Link href={`/product/${productSlug}`}>
      <div 
        className="rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
        onClick={() => console.log('🔍 Product clicked:', product.name, `→ /product/${productSlug}`)}
      >
        <img 
          src={getProductImageUrl(product)} 
          alt={getProductImageAlt(product)}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/placeholder-game.svg';
          }}
        />
      </div>
    </Link>
  );
}