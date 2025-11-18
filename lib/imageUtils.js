/**
 * Image Utilities for Product Display
 * Handles hierarchical image fallback logic across all product components
 */

/**
 * Get product image URL with hierarchical fallback logic
 * Priority: images_cover_url > images_cover > images_cover_thumbnail > placeholder
 * @param {Object} product - Product object with image data
 * @returns {string} Image URL to use
 */
export function getProductImageUrl(product) {
  if (!product) {
    return '/placeholder-game.svg';
  }

  // Ensure we always return a string to prevent React error #130
  const ensureString = (value) => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '';
      }
    }
    return String(value);
  };

  // Priority 1: Check images_cover_url (handle JSON strings and direct URLs)
  if (product.images_cover_url) {
    // Handle JSON string format like {"thumbnail":"url"}
    if (typeof product.images_cover_url === 'string') {
      // First check if it's a direct URL
      if (product.images_cover_url.startsWith('http') && product.images_cover_url.trim()) {
        const imageUrl = product.images_cover_url.trim();
        // Use proxy for external images to avoid CORS issues
        if (imageUrl.includes('kinguin.net')) {
          return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }
        return imageUrl;
      }
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(product.images_cover_url);
        if (parsed.thumbnail && parsed.thumbnail.trim()) {
          return parsed.thumbnail.trim();
        }
        if (parsed.url && parsed.url.trim()) {
          return parsed.url.trim();
        }
        if (parsed.cover && parsed.cover.trim()) {
          return parsed.cover.trim();
        }
      } catch (e) {
        // If parsing fails but it's a non-empty string, return it
        if (product.images_cover_url.trim()) {
          return product.images_cover_url.trim();
        }
      }
    }
  }

  // Priority 2: Check images_cover field
  if (product.images_cover) {
    if (typeof product.images_cover === 'string') {
      if (product.images_cover.startsWith('http') && product.images_cover.trim()) {
        return product.images_cover.trim();
      }
      
      try {
        const parsed = JSON.parse(product.images_cover);
        if (parsed.thumbnail && parsed.thumbnail.trim()) {
          return parsed.thumbnail.trim();
        }
        if (parsed.url && parsed.url.trim()) {
          return parsed.url.trim();
        }
        if (parsed.cover && parsed.cover.trim()) {
          return parsed.cover.trim();
        }
      } catch (e) {
        if (product.images_cover.trim()) {
          return product.images_cover.trim();
        }
      }
    }
  }

  // Priority 3: Check images_cover_thumbnail field
  if (product.images_cover_thumbnail) {
    if (typeof product.images_cover_thumbnail === 'string') {
      if (product.images_cover_thumbnail.startsWith('http') && product.images_cover_thumbnail.trim()) {
        return product.images_cover_thumbnail.trim();
      }
      
      try {
        const parsed = JSON.parse(product.images_cover_thumbnail);
        if (parsed.thumbnail && parsed.thumbnail.trim()) {
          return parsed.thumbnail.trim();
        }
        if (parsed.url && parsed.url.trim()) {
          return parsed.url.trim();
        }
      } catch (e) {
        if (product.images_cover_thumbnail.trim()) {
          return product.images_cover_thumbnail.trim();
        }
      }
    }
  }

  // Priority 2: Check images_cover array (JSONB)
  if (product.images_cover) {
    if (Array.isArray(product.images_cover) && product.images_cover.length > 0) {
      const firstImage = product.images_cover[0];
      if (typeof firstImage === 'string' && firstImage.trim()) {
        return firstImage.trim();
      }
      if (typeof firstImage === 'object' && firstImage && firstImage.url) {
        return firstImage.url.trim();
      }
    }
    
    // Handle JSON string format
    if (typeof product.images_cover === 'string') {
      try {
        const parsed = JSON.parse(product.images_cover);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstImage = parsed[0];
          if (typeof firstImage === 'string' && firstImage.trim()) {
            return firstImage.trim();
          }
          if (typeof firstImage === 'object' && firstImage && firstImage.url) {
            return firstImage.url.trim();
          }
        }
        if (parsed.url && parsed.url.trim()) {
          return parsed.url.trim();
        }
        if (parsed.thumbnail && parsed.thumbnail.trim()) {
          return parsed.thumbnail.trim();
        }
      } catch (e) {
        // Silent fail for JSON parsing
      }
    }
  }

  // Priority 3: Check images_cover_thumbnail
  if (product.images_cover_thumbnail && typeof product.images_cover_thumbnail === 'string' && product.images_cover_thumbnail.trim()) {
    return product.images_cover_thumbnail.trim();
  }

  // Legacy fallbacks for backward compatibility
  if (product.coverUrl && product.coverUrl.trim()) {
    return product.coverUrl.trim();
  }

  if (product.cover_url && product.cover_url.trim()) {
    return product.cover_url.trim();
  }

  // Fallback to placeholder - always return a string
  return '/placeholder-game.svg';
}

/**
 * Extract clean image URL from various data formats
 * Handles JSON strings, objects, and direct URLs
 * @param {any} imageData - Image data in various formats
 * @returns {string|null} Clean URL or null
 */
export function extractImageUrl(imageData) {
  if (!imageData) return null;
  
  // If it's already a direct URL string (HTTP or base64 data URI)
  if (typeof imageData === 'string') {
    if (imageData.startsWith('http') || imageData.startsWith('data:image')) {
      return imageData.trim();
    }
  }
  
  // If it's JSON data, parse and extract the URL
  try {
    if (typeof imageData === 'string') {
      const parsed = JSON.parse(imageData);
      return parsed.thumbnail || parsed.url || parsed.cover || null;
    }
    if (typeof imageData === 'object' && imageData !== null) {
      return imageData.thumbnail || imageData.url || imageData.cover || null;
    }
  } catch (e) {
    // If parsing fails and it's a string, return it directly (might be base64)
    if (typeof imageData === 'string' && imageData.trim()) {
      return imageData.trim();
    }
    return null;
  }
  
  return null;
}

/**
 * Get optimized image URL for different display contexts
 * @param {Object} product - Product object
 * @param {string} context - Display context: 'card', 'detail', 'thumbnail'
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(product, context = 'card') {
  const baseUrl = getProductImageUrl(product);
  
  // Return placeholder for invalid URLs
  if (baseUrl === '/placeholder-game.svg') {
    return baseUrl;
  }

  // For external URLs, return as-is (Kinguin CDN handles optimization)
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }

  // For local images, return as-is
  return baseUrl;
}

/**
 * Generate alt text for product images
 * @param {Object} product - Product object
 * @returns {string} Alt text for accessibility
 */
export function getProductImageAlt(product) {
  if (!product) {
    return 'Product image';
  }

  const productName = product.name || product.title || 'Product';
  return `${productName} - Game cover image`;
}

/**
 * Get product screenshots with hierarchical fallback logic
 * Priority: images_screenshots_url → images_screenshots → images_screenshots_thumbnail
 * @param {Object} product - Product object with screenshot data
 * @returns {Array} Array of screenshot URLs
 */
export function getProductScreenshots(product) {
  if (!product) return [];

  console.log('🎬 Checking screenshot sources for product:', product.id || 'unknown');

  let urlScreenshots = [];
  let arrayScreenshots = [];
  let thumbnailScreenshots = [];

  // Check Priority 1: images_screenshots_url (direct URL array)
  if (product.images_screenshots_url) {
    try {
      let screenshots = product.images_screenshots_url;
      console.log('📸 Found images_screenshots_url:', typeof screenshots, screenshots);
      
      // If it's a string, try to parse as JSON, otherwise treat as single URL
      if (typeof screenshots === 'string') {
        try {
          screenshots = JSON.parse(screenshots);
          console.log('📸 Parsed images_screenshots_url as JSON:', screenshots);
        } catch (e) {
          // If it's not valid JSON, treat as single URL
          screenshots = [screenshots];
          console.log('📸 Treating images_screenshots_url as single URL:', screenshots);
        }
      }
      
      // Handle array of URLs
      if (Array.isArray(screenshots)) {
        urlScreenshots = screenshots.filter(url => url && url.trim() !== '');
        console.log('📸 images_screenshots_url processed:', urlScreenshots.length, 'screenshots');
      }
    } catch (e) {
      console.warn('Error parsing images_screenshots_url:', e);
    }
  }

  // Check Priority 2: images_screenshots (JSONB array with objects)
  if (product.images_screenshots) {
    try {
      let screenshots = product.images_screenshots;
      console.log('📸 Found images_screenshots:', typeof screenshots, Array.isArray(screenshots) ? screenshots.length : 'not array');
      
      // If it's a string, try to parse it (handling malformed JSON with escaped quotes)
      if (typeof screenshots === 'string') {
        try {
          // First try direct parsing
          screenshots = JSON.parse(screenshots);
        } catch (e) {
          // Handle malformed JSONB with escaped quotes from Kinguin import
          try {
            // Fix common JSONB format issues: {"url": "..."} objects separated by commas
            const cleanedString = screenshots
              .replace(/\\"url\\"/g, '"url"')  // Fix escaped quotes in url keys
              .replace(/\\"/g, '"')           // Fix other escaped quotes
              .replace(/"{/g, '{')            // Remove quotes around objects
              .replace(/}"/g, '}')            // Remove quotes around objects
              .replace(/}{/g, '},{');         // Add commas between objects
            
            // Wrap in array brackets if needed
            const arrayString = cleanedString.startsWith('[') ? cleanedString : `[${cleanedString}]`;
            screenshots = JSON.parse(arrayString);
            console.log('📸 Fixed malformed images_screenshots JSON:', screenshots);
          } catch (e2) {
            console.warn('Failed to fix malformed images_screenshots JSON:', e2);
            screenshots = [];
          }
        }
      }
      
      // Handle array of objects or direct URLs
      if (Array.isArray(screenshots)) {
        arrayScreenshots = screenshots.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return item.url || item.thumbnail || item.original || null;
          }
          return null;
        }).filter(Boolean);
        
        console.log('📸 images_screenshots processed:', arrayScreenshots.length, 'screenshots');
      }
    } catch (e) {
      console.warn('Error parsing images_screenshots:', e);
    }
  }

  // Check Priority 3: images_screenshots_thumbnail (thumbnail URL array)
  if (product.images_screenshots_thumbnail) {
    try {
      let screenshots = product.images_screenshots_thumbnail;
      console.log('📸 Found images_screenshots_thumbnail:', typeof screenshots, screenshots);
      
      // If it's a string, parse it
      if (typeof screenshots === 'string') {
        try {
          screenshots = JSON.parse(screenshots);
          console.log('📸 Parsed images_screenshots_thumbnail as JSON:', screenshots);
        } catch (e) {
          // Treat as single URL if not JSON
          screenshots = [screenshots];
        }
      }
      
      // Handle array of URLs
      if (Array.isArray(screenshots)) {
        thumbnailScreenshots = screenshots.filter(url => url && url.trim() !== '');
        console.log('📸 images_screenshots_thumbnail processed:', thumbnailScreenshots.length, 'screenshots');
      }
    } catch (e) {
      console.warn('Error parsing images_screenshots_thumbnail:', e);
    }
  }

  // Now apply intelligent priority logic: Use the source with the most screenshots
  // Unless images_screenshots_url has multiple screenshots (then it takes priority)
  let finalScreenshots = [];
  let sourceUsed = '';

  if (urlScreenshots.length > 1) {
    // If images_screenshots_url has multiple screenshots, use it (highest priority)
    finalScreenshots = urlScreenshots;
    sourceUsed = 'images_screenshots_url';
  } else if (arrayScreenshots.length > 0) {
    // Use images_screenshots if it has any screenshots (best data source)
    finalScreenshots = arrayScreenshots;
    sourceUsed = 'images_screenshots';
  } else if (urlScreenshots.length === 1) {
    // Fall back to single URL from images_screenshots_url
    finalScreenshots = urlScreenshots;
    sourceUsed = 'images_screenshots_url';
  } else if (thumbnailScreenshots.length > 0) {
    // Final fallback to thumbnails
    finalScreenshots = thumbnailScreenshots;
    sourceUsed = 'images_screenshots_thumbnail';
  }

  if (finalScreenshots.length > 0) {
    console.log('✅ Using', sourceUsed + ':', finalScreenshots.length, 'screenshots');
    return finalScreenshots;
  }

  // Legacy fallback: check images JSON structure
  if (product.images) {
    try {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (images && images.screenshots && Array.isArray(images.screenshots)) {
        const urls = images.screenshots.map(item => {
          if (typeof item === 'string') return item;
          return item.url || item.thumbnail || null;
        }).filter(Boolean);
        
        if (urls.length > 0) return urls;
      }
    } catch (e) {
      console.warn('Error parsing legacy images JSON:', e);
    }
  }

  return [];
}