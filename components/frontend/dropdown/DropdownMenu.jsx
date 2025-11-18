import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainCategoriesColumn from './MainCategoriesColumn';
import SubcategoriesColumn from './SubcategoriesColumn';
import PopularProductsColumn from './PopularProductsColumn';

/**
 * Professional Three-Column Dropdown Menu
 * Modular, reusable component with dynamic data loading
 */
export default function DropdownMenu({ 
  isVisible, 
  onClose,
  categories: initialCategories = [],
  loading = false
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
  const [clickedSubcategory, setClickedSubcategory] = useState(null);

  // Update categories when prop changes
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  // Auto-select first category when dropdown opens and categories are available
  useEffect(() => {
    if (isVisible && categories.length > 0 && !selectedCategory) {
      // Automatically select the first category based on display order
      const firstCategory = categories[0];
      setSelectedCategory(firstCategory);
      console.log('🎯 Auto-selected first category:', firstCategory.name);
    }
  }, [isVisible, categories, selectedCategory]);

  // Reset selections when dropdown closes
  useEffect(() => {
    if (!isVisible) {
      setSelectedCategory(null);
      setHoveredSubcategory(null);
      setClickedSubcategory(null);
    }
  }, [isVisible]);

  // Handle category selection and hover
  const handleCategorySelect = (category) => {
    console.log('🔍 Category clicked:', category.name, category.slug);
    // Navigate to main category page
    if (category.slug) {
      console.log('🔀 Navigating to:', `/category/${category.slug}`);
      router.push(`/category/${category.slug}`);
      if (onClose) onClose();
    }
    setSelectedCategory(category);
    setClickedSubcategory(null);
    setHoveredSubcategory(null);
  };

  const handleCategoryHover = (category) => {
    setSelectedCategory(category);
    setClickedSubcategory(null);
    setHoveredSubcategory(null);
  };

  // Handle subcategory hover and selection
  const handleSubcategoryHover = (subcategory) => {
    setHoveredSubcategory(subcategory);
  };

  const handleSubcategorySelect = (subcategory) => {
    console.log('🔍 Subcategory clicked:', subcategory.name, subcategory.slug);
    // Navigate to subcategory page
    if (subcategory.slug) {
      console.log('🔀 Navigating to:', `/category/${subcategory.slug}`);
      router.push(`/category/${subcategory.slug}`);
      if (onClose) onClose();
    }
    setClickedSubcategory(subcategory);
    setHoveredSubcategory(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="w-full shadow-2xl hidden md:block"
      style={{ 
        borderRadius: '16px',
        border: 'none',
        background: 'linear-gradient(135deg, #153e90 0%, #2c519b 50%, #29adb2 100%)'
      }}
    >
      <div className="flex min-h-60">
        {/* Column 1 - Main Categories */}
        <MainCategoriesColumn
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onCategoryHover={handleCategoryHover}
          loading={loading}
        />

        {/* Column 2 - Subcategories */}
        <SubcategoriesColumn
          selectedCategory={selectedCategory}
          hoveredSubcategory={hoveredSubcategory}
          clickedSubcategory={clickedSubcategory}
          onSubcategoryHover={handleSubcategoryHover}
          onSubcategorySelect={handleSubcategorySelect}
        />

        {/* Column 3 - Popular Products */}
        <PopularProductsColumn
          selectedCategory={selectedCategory}
          hoveredSubcategory={hoveredSubcategory}
          clickedSubcategory={clickedSubcategory}
        />
      </div>
    </div>
  );
}