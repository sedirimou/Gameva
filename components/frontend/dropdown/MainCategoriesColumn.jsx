import React from 'react';
import { DROPDOWN_STYLES, getItemClasses, getProductCount } from './DropdownStyles';

/**
 * Standardized Main Categories Component (Column 1)
 * Uses shared styles for consistent design
 */
export default function MainCategoriesColumn({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  onCategoryHover,
  loading = false
}) {
  // Ensure categories is always an array
  const categoryList = Array.isArray(categories) ? categories : [];
  
  // Debug logging to understand cache data structure
  if (process.env.NODE_ENV === 'development' && categories && !Array.isArray(categories)) {
    console.warn('Categories is not an array:', typeof categories, categories);
  }
  
  if (loading) {
    return (
      <div className={`${DROPDOWN_STYLES.COLUMN_LEFT_SMALL} ${DROPDOWN_STYLES.COLUMN_BASE}`}>
        <div className={DROPDOWN_STYLES.HEADER_CONTAINER}>
          <h3 className={DROPDOWN_STYLES.HEADER_TITLE}>Categories</h3>
        </div>
        <div className={DROPDOWN_STYLES.EMPTY_STATE}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={`${DROPDOWN_STYLES.COLUMN_LEFT} ${DROPDOWN_STYLES.COLUMN_BASE}`}>
      <div className={DROPDOWN_STYLES.HEADER_CONTAINER}>
        <h3 className={DROPDOWN_STYLES.HEADER_TITLE}>Categories</h3>
      </div>
      <div className={DROPDOWN_STYLES.CONTENT_CONTAINER}>
        {categoryList.length === 0 ? (
          <div className={DROPDOWN_STYLES.EMPTY_STATE}>No categories available</div>
        ) : (
          categoryList.map((category) => (
            <div key={category.id} className="group">
              <div 
                onMouseEnter={() => onCategoryHover(category)}
                onClick={() => onCategorySelect(category)}
                className={getItemClasses(selectedCategory?.id === category.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* Standardized Icon Display */}
                  {category.icon && category.icon.startsWith('data:') && (
                    <img src={category.icon} alt="" className="w-6 h-6 object-cover rounded" />
                  )}
                  <span className="font-medium">{category.name}</span>
                </div>
                
                {/* Standardized Counter */}
                <span className={DROPDOWN_STYLES.COUNTER_BADGE}>
                  {getProductCount(category.product_count)}
                </span>
              </div>
              
              {/* Standardized Banner Display */}
              {selectedCategory?.id === category.id && category.banner && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img 
                    src={category.banner} 
                    alt={category.name}
                    className="w-full h-20 object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}