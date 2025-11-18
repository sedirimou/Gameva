/**
 * ProductGrid Component - Dynamic product listings
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '../../../hooks/useCurrency';

const ProductGrid = ({ data }) => {
  const {
    title = 'Featured Products',
    displayType = 'latest',
    count = '8',
    columns = '4',
    showPrices = true,
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, [displayType, count]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${count}&type=${displayType}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const gridColumns = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
  };

  const containerStyle = {
    marginTop,
    marginBottom
  };

  if (loading) {
    return (
      <div 
        className={`${customClasses}`}
        style={containerStyle}
      >
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        )}
        <div className={`grid ${gridColumns[columns]} gap-4`}>
          {Array.from({ length: parseInt(count) }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div 
        className={`text-center py-8 ${customClasses}`}
        style={containerStyle}
      >
        {title && (
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
        )}
        <div className="text-gray-500">No products found</div>
      </div>
    );
  }

  return (
    <div 
      className={`${customClasses}`}
      style={containerStyle}
    >
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      
      <div className={`grid ${gridColumns[columns]} gap-4`}>
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/product/${product.slug || product.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={product.images_cover_thumbnail || product.images_cover_url || '/placeholder-game.svg'}
                alt={product.title || product.name}
                onError={(e) => {
                  e.target.src = '/placeholder-game.svg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2 text-gray-900 mb-1">
                {product.title || product.name}
              </h3>
              
              {product.platform && (
                <div className="text-xs text-gray-500 mb-2">
                  {product.platform}
                </div>
              )}

              {showPrices && (
                <div className="flex items-center justify-between">
                  {product.sale_price && product.sale_price < product.price ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;