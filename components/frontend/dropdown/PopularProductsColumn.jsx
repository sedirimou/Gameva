import React, { useState, useEffect } from 'react';
import { DROPDOWN_STYLES } from './DropdownStyles';
import Menu_ProductCard from './Menu_ProductCard';

/**
 * Standardized Popular Products Component (Column 3)
 * Uses shared styles for consistent design
 */
export default function PopularProductsColumn({ 
  selectedCategory,
  hoveredSubcategory,
  clickedSubcategory
}) {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Determine which category to show products for
  const targetCategory = hoveredSubcategory || clickedSubcategory || selectedCategory;
  const displayTitle = hoveredSubcategory?.name || clickedSubcategory?.name || selectedCategory?.name || 'Popular Products';

  useEffect(() => {
    const fetchPopularProducts = async () => {
      if (!targetCategory?.id) {
        setPopularProducts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/admin/categories/popular-products?categoryId=${targetCategory.id}`);
        if (response.ok) {
          const data = await response.json();
          setPopularProducts(data.products || []);
        } else {
          setPopularProducts([]);
        }
      } catch (error) {
        console.error('Error fetching popular products:', error);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, [targetCategory?.id]);

  if (loading) {
    return (
      <div className={`${DROPDOWN_STYLES.COLUMN_RIGHT} ${DROPDOWN_STYLES.COLUMN_BASE}`}>
        <div className={DROPDOWN_STYLES.HEADER_CONTAINER}>
          <h3 className={DROPDOWN_STYLES.HEADER_TITLE}>Popular Products</h3>
        </div>
        <div className={DROPDOWN_STYLES.PRODUCT_GRID}>
          {[...Array(2)].map((_, index) => (
            <Menu_ProductCard key={`loading-${index}`} isLoading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${DROPDOWN_STYLES.COLUMN_RIGHT} ${DROPDOWN_STYLES.COLUMN_BASE}`}>
      <div className={DROPDOWN_STYLES.HEADER_CONTAINER}>
        <h3 className={DROPDOWN_STYLES.HEADER_TITLE}>
          Popular in {displayTitle}
        </h3>
      </div>
      <div className={DROPDOWN_STYLES.PRODUCT_GRID}>
        {popularProducts.length > 0 ? (
          popularProducts.slice(0, 2).map((product) => (
            <Menu_ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className={DROPDOWN_STYLES.PRODUCT_GRID_EMPTY}>
            {selectedCategory ? 'No popular products available' : 'Select a category to see popular products'}
          </div>
        )}
      </div>
    </div>
  );
}