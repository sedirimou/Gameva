/**
 * React Error #130 Prevention Utilities
 * Ensures objects are never rendered as JSX children
 */

/**
 * Safely converts any value to a string for JSX rendering
 * Prevents React error #130 (object being rendered as JSX children)
 */
export function safeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return String(fallback);
  }
  
  if (typeof value === 'object') {
    // For objects, return JSON string or fallback
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(fallback);
    }
  }
  
  return String(value);
}

/**
 * Safely renders JSX text content with guaranteed string conversion
 */
export function SafeText({ children, fallback = '' }) {
  return safeString(children, fallback);
}

/**
 * Validates product data to prevent object rendering issues
 */
export function validateProductData(product) {
  if (!product || typeof product !== 'object') {
    return {
      id: '',
      name: 'Loading...',
      platform: '',
      price: '0.00',
      images_cover_url: '/placeholder-game.svg'
    };
  }

  return {
    ...product,
    id: safeString(product.id),
    name: safeString(product.name, 'Loading...'),
    platform: safeString(product.platform),
    region: safeString(product.region),
    price: safeString(product.price, '0.00'),
    sale_price: safeString(product.sale_price),
    final_price: safeString(product.final_price),
    images_cover_url: safeString(product.images_cover_url, '/placeholder-game.svg')
  };
}

/**
 * Validates hero slide data for HeroSlider component
 */
export function validateHeroData(slide) {
  if (!slide || typeof slide !== 'object') {
    return {
      id: '1',
      title: '',
      button_label: 'Shop Now',
      image: '/placeholder-game.svg',
      link: '/'
    };
  }

  return {
    ...slide,
    id: safeString(slide.id, '1'),
    title: safeString(slide.title),
    button_label: safeString(slide.button_label, 'Shop Now'),
    image: safeString(slide.image, '/placeholder-game.svg'),
    link: safeString(slide.link, '/')
  };
}

/**
 * Development warning for object rendering attempts
 */
export function checkObjectRendering(value, componentName = 'Component') {
  if (process.env.NODE_ENV === 'development' && typeof value === 'object' && value !== null) {
    console.warn(`⚠️ [${componentName}] Potential React Error #130: Object being rendered as JSX children`, value);
  }
}