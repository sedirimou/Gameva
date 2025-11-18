import React from 'react';
import ProductCard from './ProductCard';

export default function SweeperGrid({ products = [] }) {
  return (
    <div className="my-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.id || index}>
              <ProductCard product={product} index={index} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No products to display</p>
          </div>
        )}
      </div>
    </div>
  );
}