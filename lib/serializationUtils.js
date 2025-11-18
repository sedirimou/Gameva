/**
 * Serialization utilities to prevent React error #130 
 * "Objects are not valid as a React child" in production deployments
 */

/**
 * Safely serialize data for Next.js getServerSideProps to prevent React error #130
 * @param {any} data - Data to serialize
 * @returns {any} Safely serialized data
 */
export function safeSerialize(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => safeSerialize(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = safeSerialize(value);
    }
    return serialized;
  }

  // Handle primitives
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle BigInt
  if (typeof data === 'bigint') {
    return data.toString();
  }

  // Handle functions, symbols, etc. - convert to string
  if (typeof data === 'function' || typeof data === 'symbol') {
    return data.toString();
  }

  // Fallback for unknown types
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to serialize data:', data, error);
    return String(data);
  }
}

/**
 * Safely serialize product data specifically for React components
 * @param {Object} product - Product object from database
 * @returns {Object} Safely serialized product
 */
export function safeSerializeProduct(product) {
  if (!product) return null;

  return {
    id: String(product.id || ''),
    name: String(product.name || ''),
    platform: String(product.platform || ''),
    price: parseFloat(product.price) || 0,
    sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
    qty: parseInt(product.qty) || 0,
    slug: String(product.slug || ''),
    images_cover_url: String(product.images_cover_url || '/placeholder-game.svg'),
    images_cover_thumbnail: String(product.images_cover_thumbnail || ''),
    originalName: String(product.originalName || ''),
    genres: Array.isArray(product.genres) ? product.genres.map(String) : [],
    developers: Array.isArray(product.developers) ? product.developers.map(String) : [],
    publishers: Array.isArray(product.publishers) ? product.publishers.map(String) : [],
    releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString() : null,
    ageRating: String(product.ageRating || ''),
    languages: Array.isArray(product.languages) ? product.languages.map(String) : [],
    // Ensure images_screenshots is properly serialized
    images_screenshots: Array.isArray(product.images_screenshots) 
      ? product.images_screenshots.map(String) 
      : [],
    images_screenshots_url: String(product.images_screenshots_url || ''),
    // Serialize any additional fields
    ...Object.keys(product).reduce((acc, key) => {
      if (!['id', 'name', 'platform', 'price', 'sale_price', 'qty', 'slug', 
            'images_cover_url', 'images_cover_thumbnail', 'originalName', 
            'genres', 'developers', 'publishers', 'releaseDate', 'ageRating', 
            'languages', 'images_screenshots', 'images_screenshots_url'].includes(key)) {
        acc[key] = safeSerialize(product[key]);
      }
      return acc;
    }, {})
  };
}

/**
 * Validate that data is safe for React rendering
 * @param {any} data - Data to validate
 * @param {string} context - Context for error reporting
 * @returns {boolean} Whether data is safe
 */
export function validateForReactRender(data, context = 'unknown') {
  try {
    // Test JSON serialization
    JSON.stringify(data);
    
    // Check for functions or symbols in nested objects
    const hasUnsafeValues = (obj) => {
      if (obj === null || obj === undefined) return false;
      if (typeof obj === 'function' || typeof obj === 'symbol') return true;
      if (Array.isArray(obj)) return obj.some(hasUnsafeValues);
      if (typeof obj === 'object') {
        return Object.values(obj).some(hasUnsafeValues);
      }
      return false;
    };
    
    if (hasUnsafeValues(data)) {
      console.warn(`Unsafe data detected in ${context}:`, data);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Validation failed for ${context}:`, error, data);
    return false;
  }
}

/**
 * Strip non-serializable properties from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export function stripNonSerializable(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      cleaned[key] = value;
    } else if (typeof value === 'function' || typeof value === 'symbol') {
      // Skip functions and symbols
      continue;
    } else if (value instanceof Date) {
      cleaned[key] = value.toISOString();
    } else if (typeof value === 'bigint') {
      cleaned[key] = value.toString();
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(stripNonSerializable);
    } else if (typeof value === 'object') {
      cleaned[key] = stripNonSerializable(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}