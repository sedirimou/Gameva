import React from 'react';
import { DROPDOWN_STYLES, getItemClasses, getProductCount } from './DropdownStyles';

/**
 * Standardized Subcategories Component (Column 2)
 * Uses shared styles for consistent design
 */
export default function SubcategoriesColumn({ 
  selectedCategory,
  hoveredSubcategory,
  clickedSubcategory,
  onSubcategoryHover,
  onSubcategorySelect
}) {
  return (
    <div className={`${DROPDOWN_STYLES.COLUMN_MIDDLE} ${DROPDOWN_STYLES.COLUMN_BASE}`}>
      <div className={DROPDOWN_STYLES.HEADER_CONTAINER}>
        <h3 className={DROPDOWN_STYLES.HEADER_TITLE}>
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </h3>
      </div>
      <div className={DROPDOWN_STYLES.CONTENT_CONTAINER}>
        {selectedCategory?.children && selectedCategory.children.length > 0 ? (
          selectedCategory.children.map((subcategory) => (
            <div 
              key={subcategory.id}
              onMouseEnter={() => onSubcategoryHover(subcategory)}
              onClick={() => onSubcategorySelect(subcategory)}
              className={getItemClasses(
                clickedSubcategory?.id === subcategory.id || hoveredSubcategory?.id === subcategory.id
              )}
            >
              <span className="font-medium">{subcategory.name}</span>
              {/* Standardized Counter */}
              <span className={DROPDOWN_STYLES.COUNTER_BADGE}>
                {getProductCount(subcategory.product_count)}
              </span>
            </div>
          ))
        ) : (
          <div className={DROPDOWN_STYLES.EMPTY_STATE}>
            {selectedCategory ? 'No subcategories available' : 'Select a category to see subcategories'}
          </div>
        )}
      </div>
    </div>
  );
}