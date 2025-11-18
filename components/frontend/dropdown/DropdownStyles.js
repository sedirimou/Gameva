/**
 * Standardized Dropdown Column Styles
 * Shared constants and utilities for consistent dropdown design
 */

// Container Styles
export const DROPDOWN_STYLES = {
  // Column containers with exact width specifications
  COLUMN_BASE: "px-4 pt-6 pb-6", // More padding for categories and subcategories
  COLUMN_LEFT: "w-1/4 min-w-[200px] h-full", // 25% width for Main Categories
  COLUMN_MIDDLE: "w-1/4 min-w-[200px] border-l border-white/10 h-full", // 25% width for Subcategories  
  COLUMN_RIGHT: "w-1/2 min-w-[400px] border-l border-white/10 h-full", // 50% width for Popular Products
  
  // Background styles - removed individual column backgrounds to allow container gradient to show through
  
  // Headers with consistent padding
  HEADER_CONTAINER: "mb-4 px-2",
  HEADER_TITLE: "font-bold text-white text-lg",
  
  // Content areas
  CONTENT_CONTAINER: "space-y-1 min-h-[200px]",
  EMPTY_STATE: "text-white/60 text-sm py-4 flex items-center justify-center h-32",
  
  // Interactive items with more padding
  ITEM_BASE: "px-3 py-3 cursor-pointer rounded-lg transition-colors flex items-center justify-between whitespace-nowrap overflow-hidden",
  ITEM_ACTIVE: "bg-white/30 text-white",
  ITEM_INACTIVE: "text-white/90 hover:bg-white/20",
  
  // Counters and badges
  COUNTER_BADGE: "text-xs opacity-60 bg-white/10 px-2 py-1 rounded",
  
  // Product cards
  PRODUCT_CARD: "rounded-lg p-3 hover:opacity-90 transition-opacity cursor-pointer h-full flex flex-col justify-between",
  // PRODUCT_CARD_BG removed to allow container gradient to show through
  // Simple 2-column grid layout for popular products
  PRODUCT_GRID: "grid grid-cols-2 gap-3 min-h-[200px]",
  PRODUCT_GRID_EMPTY: "col-span-full text-white/60 text-sm py-4 flex items-center justify-center h-32",
  
  // Small screen responsive behavior (below 1100px)
  COLUMN_LEFT_SMALL: "w-1/2 rounded-l-2xl max-[1099px]:w-1/2", // 50% width below 1100px
  COLUMN_MIDDLE_SMALL: "w-1/2 border-l border-white/10 max-[1099px]:w-1/2 max-[1099px]:rounded-r-2xl", // 50% width below 1100px, rounded right
  COLUMN_RIGHT_RESPONSIVE: "w-1/2 border-l border-white/10 rounded-r-2xl hidden min-[1100px]:block" // Hide below 1100px
};

// Component utilities
export const getItemClasses = (isActive) => {
  return `${DROPDOWN_STYLES.ITEM_BASE} ${
    isActive ? DROPDOWN_STYLES.ITEM_ACTIVE : DROPDOWN_STYLES.ITEM_INACTIVE
  }`;
};

export const getProductCount = (count) => {
  return count > 0 ? count.toString() : '0';
};

// Legacy formatPrice function - will be replaced by useCurrency hook in components
export const formatPrice = (price) => {
  if (!price || isNaN(price)) {
    return '€0.00';
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
};

// Currency-aware price formatter - requires currency data to be passed
export const formatPriceWithCurrency = (price, currencyData) => {
  if (!price || isNaN(price)) {
    return currencyData ? `${currencyData.symbol}0.${'0'.repeat(currencyData.decimals || 2)}` : '€0.00';
  }
  
  if (!currencyData) {
    return formatPrice(price);
  }
  
  const convertedPrice = parseFloat(price) * parseFloat(currencyData.exchange_rate || 1);
  const formattedAmount = convertedPrice.toFixed(currencyData.decimals || 2);
  
  if (currencyData.symbol_position === 'after') {
    return `${formattedAmount} ${currencyData.symbol}`;
  } else {
    return `${currencyData.symbol}${formattedAmount}`;
  }
};